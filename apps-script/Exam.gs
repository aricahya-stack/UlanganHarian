function normalizeExam_(row) {
  return {
    examId:String(row.examId), ownerId:String(row.ownerId||''), title:String(row.title), subject:String(row.subject), className:String(row.className),
    startTime:new Date(row.startTime).toISOString(), endTime:new Date(row.endTime).toISOString(),
    durationMinutes:Number(row.durationMinutes||0), questionCount:Number(row.questionCount||0), status:String(row.status),
    randomizeQuestion:asBool_(row.randomizeQuestion), randomizeOption:asBool_(row.randomizeOption),
    resultVisibility:String(row.resultVisibility||'hidden'), tokenRequired:Boolean(row.token), attemptPolicy:String(row.attemptPolicy||'single'), instructions:String(row.instructions||'')
  };
}
function getAvailableExams_(payload) {
  const ctx=requireSession_(payload.token,'student'); const now=Date.now();
  const attempts=rows_('ATTEMPTS').filter(a=>String(a.studentId)===String(ctx.user.userId));
  const submissions=rows_('SUBMISSIONS');
  return rows_('EXAMS').filter(e=>String(e.className)===String(ctx.user.className) && ['PUBLISHED','ACTIVE','CLOSED'].indexOf(String(e.status))>=0).map(e=>{
    const exam=normalizeExam_(e); const attempt=attempts.find(a=>String(a.examId)===exam.examId); const sub=attempt?submissions.find(s=>String(s.attemptId)===String(attempt.attemptId)):null;
    return Object.assign({},exam,{attemptStatus:attempt?String(attempt.status):undefined,attemptId:attempt?String(attempt.attemptId):undefined,score:sub?Number(sub.score):null,tokenRequired:Boolean(e.token),availableNow:new Date(e.startTime).getTime()<=now&&new Date(e.endTime).getTime()>=now});
  });
}
function startExam_(payload) {
  const ctx=requireSession_(payload.token,'student');
  const examRow=findRowByKey_('EXAMS','examId',payload.examId); if(!examRow) throw apiError_('Ujian tidak ditemukan.','NOT_FOUND');
  if(String(examRow.className)!==String(ctx.user.className)) throw apiError_('Ujian tidak tersedia untuk kelas Anda.','FORBIDDEN');
  const now=Date.now(), start=new Date(examRow.startTime).getTime(), end=new Date(examRow.endTime).getTime();
  if(now<start) throw apiError_('Ujian belum dimulai.','NOT_STARTED'); if(now>end) throw apiError_('Waktu ujian telah berakhir.','EXPIRED');
  if(examRow.token && String(examRow.token)!==String(payload.examToken||'')) throw apiError_('Token ujian tidak sesuai.','INVALID_TOKEN');

  let existing=rows_('ATTEMPTS').find(a=>String(a.examId)===String(payload.examId)&&String(a.studentId)===String(ctx.user.userId));
  if(existing){ if(String(existing.status)==='IN_PROGRESS') return resumeAttempt_(Object.assign({},payload,{attemptId:existing.attemptId,offset:0,limit:SM.BATCH_SIZE})); if(String(existing.status)==='SUBMITTED') throw apiError_('Ujian ini sudah dikumpulkan.','ALREADY_SUBMITTED'); }

  const allQuestions=rows_('QUESTIONS').filter(q=>String(q.examId)===String(payload.examId)&&String(q.status)==='ACTIVE');
  if(!allQuestions.length) throw apiError_('Soal ujian belum tersedia.','NO_QUESTIONS');
  const configuredCount=Math.min(Number(examRow.questionCount||allQuestions.length),allQuestions.length);
  let order=allQuestions.slice(0,configuredCount).map(q=>String(q.questionId)); if(asBool_(examRow.randomizeQuestion)) order=shuffle_(order);
  const optionOrders={}; order.forEach(id=>optionOrders[id]=asBool_(examRow.randomizeOption)?shuffle_(['A','B','C','D']):['A','B','C','D']);
  const startedAt=new Date(); const expiresAt=new Date(Math.min(startedAt.getTime()+Number(examRow.durationMinutes)*60000,end)); const attemptId=uid_('ATT');

  // Critical section dibuat sesingkat mungkin: hanya re-check duplikasi dan append attempt.
  // Ini menghindari script lock menahan seluruh proses start ketika banyak siswa masuk bersamaan.
  const lock=LockService.getScriptLock(); lock.waitLock(5000);
  try {
    existing=rows_('ATTEMPTS').find(a=>String(a.examId)===String(payload.examId)&&String(a.studentId)===String(ctx.user.userId));
    if(existing){
      if(String(existing.status)==='IN_PROGRESS') return resumeAttempt_(Object.assign({},payload,{attemptId:existing.attemptId,offset:0,limit:SM.BATCH_SIZE}));
      if(String(existing.status)==='SUBMITTED') throw apiError_('Ujian ini sudah dikumpulkan.','ALREADY_SUBMITTED');
    }
    appendObject_('ATTEMPTS',{attemptId,examId:payload.examId,studentId:ctx.user.userId,startedAt:startedAt.toISOString(),expiresAt:expiresAt.toISOString(),lastSyncAt:startedAt.toISOString(),revision:0,status:'IN_PROGRESS',submittedAt:'',questionOrderJson:JSON.stringify(order),optionOrderJson:JSON.stringify(optionOrders),answersJson:'{}'});
  } finally { lock.releaseLock(); }

  audit_(ctx.user.userId,'START_EXAM',attemptId,{examId:payload.examId});
  const attempt=attemptDto_(findRowByKey_('ATTEMPTS','attemptId',attemptId),examRow);
  return {attempt,initialQuestions:questionBatchForAttempt_(attemptId,0,SM.BATCH_SIZE),offset:0,hasMore:order.length>SM.BATCH_SIZE};
}
function attemptDto_(attemptRow,examRow){const exam=normalizeExam_(examRow);return {attemptId:String(attemptRow.attemptId),examId:String(attemptRow.examId),studentId:String(attemptRow.studentId),startedAt:new Date(attemptRow.startedAt).toISOString(),expiresAt:new Date(attemptRow.expiresAt).toISOString(),serverTime:nowIso_(),revision:Number(attemptRow.revision||0),status:String(attemptRow.status),questionCount:safeJsonParse_(attemptRow.questionOrderJson,[]).length,batchSize:SM.BATCH_SIZE,exam};}
function resumeAttempt_(payload){const ctx=requireSession_(payload.token,'student');const attempt=findRowByKey_('ATTEMPTS','attemptId',payload.attemptId);if(!attempt||String(attempt.studentId)!==String(ctx.user.userId))throw apiError_('Attempt tidak ditemukan.','NOT_FOUND');const exam=findRowByKey_('EXAMS','examId',attempt.examId);if(!exam)throw apiError_('Ujian tidak ditemukan.','NOT_FOUND');const offset=Number(payload.offset||0),limit=Math.max(1,Math.min(20,Number(payload.limit||SM.BATCH_SIZE))),order=safeJsonParse_(attempt.questionOrderJson,[]);return {attempt:attemptDto_(attempt,exam),answers:safeJsonParse_(attempt.answersJson,{}),questions:questionBatchForAttempt_(attempt.attemptId,offset,limit),offset,hasMore:offset+limit<order.length};}
function getQuestionsBatch_(payload){const ctx=requireSession_(payload.token,'student');const attempt=findRowByKey_('ATTEMPTS','attemptId',payload.attemptId);if(!attempt||String(attempt.studentId)!==String(ctx.user.userId))throw apiError_('Attempt tidak ditemukan.','NOT_FOUND');if(String(attempt.status)!=='IN_PROGRESS')throw apiError_('Attempt tidak aktif.','ATTEMPT_CLOSED');const offset=Math.max(0,Number(payload.offset||0)),limit=Math.max(1,Math.min(20,Number(payload.limit||SM.BATCH_SIZE))),order=safeJsonParse_(attempt.questionOrderJson,[]);return {questions:questionBatchForAttempt_(attempt.attemptId,offset,limit),offset,hasMore:offset+limit<order.length};}
function questionBatchForAttempt_(attemptId,offset,limit){const attempt=findRowByKey_('ATTEMPTS','attemptId',attemptId);if(!attempt)return[];const order=safeJsonParse_(attempt.questionOrderJson,[]),optionOrders=safeJsonParse_(attempt.optionOrderJson,{}),ids=order.slice(offset,offset+limit),all=rows_('QUESTIONS');return ids.map((id,idx)=>{const q=all.find(x=>String(x.questionId)===String(id));if(!q)return null;const source={A:String(q.optionA),B:String(q.optionB),C:String(q.optionC),D:String(q.optionD)};const ordered=(optionOrders[id]||['A','B','C','D']).map(key=>({key,label:source[key]}));return {questionId:String(q.questionId),number:offset+idx+1,text:String(q.questionText),options:ordered,imageFileId:q.imageFileId?String(q.imageFileId):null,imageUrl:q.imageFileId?drivePublicUrl_(String(q.imageFileId)):null,difficulty:String(q.difficulty||''),tag:String(q.tag||'')};}).filter(Boolean);}
function saveAnswers_(payload){
  const ctx=requireSession_(payload.token,'student');
  const attempt=findRowByKey_('ATTEMPTS','attemptId',payload.attemptId);
  if(!attempt||String(attempt.studentId)!==String(ctx.user.userId))throw apiError_('Attempt tidak ditemukan.','NOT_FOUND');
  if(String(attempt.status)!=='IN_PROGRESS')throw apiError_('Attempt tidak aktif.','ATTEMPT_CLOSED');
  if(new Date(attempt.expiresAt).getTime()<Date.now())throw apiError_('Waktu ujian telah habis.','EXPIRED');
  const currentRev=Number(attempt.revision||0),incoming=Number(payload.revision||0);
  if(incoming<currentRev)throw apiError_('Revision jawaban lebih lama daripada server.','STALE_REVISION');
  const order=safeJsonParse_(attempt.questionOrderJson,[]),valid={},incomingAnswers=payload.answers||{};
  Object.keys(incomingAnswers).forEach(qid=>{if(order.indexOf(qid)>=0&&['A','B','C','D'].indexOf(String(incomingAnswers[qid]))>=0)valid[qid]=String(incomingAnswers[qid]);});
  const merged=Object.assign({},safeJsonParse_(attempt.answersJson,{}),valid),nextRev=Math.max(currentRev+1,incoming),lastSyncAt=nowIso_();
  // Satu write ke row attempt milik siswa; tanpa global ScriptLock agar autosave ratusan siswa tidak terserialisasi.
  updateKnownRow_('ATTEMPTS',attempt,{answersJson:JSON.stringify(merged),revision:nextRev,lastSyncAt});
  return {attemptId:String(attempt.attemptId),revision:nextRev,lastSyncAt};
}
function submitExam_(payload){
  const ctx=requireSession_(payload.token,'student');
  let attempt=findRowByKey_('ATTEMPTS','attemptId',payload.attemptId);
  if(!attempt||String(attempt.studentId)!==String(ctx.user.userId))throw apiError_('Attempt tidak ditemukan.','NOT_FOUND');
  const already=rows_('SUBMISSIONS').find(s=>String(s.attemptId)===String(attempt.attemptId));
  if(already)return {submissionId:String(already.submissionId),attemptId:String(attempt.attemptId),accepted:true,alreadySubmitted:true,submittedAt:new Date(already.submittedAt).toISOString(),result:buildResult_(already,findRowByKey_('EXAMS','examId',attempt.examId),attempt,ctx.user.role)};
  const order=safeJsonParse_(attempt.questionOrderJson,[]),serverAnswers=safeJsonParse_(attempt.answersJson,{}),incoming=payload.answers||{};
  Object.keys(incoming).forEach(qid=>{if(order.indexOf(qid)>=0&&['A','B','C','D'].indexOf(String(incoming[qid]))>=0)serverAnswers[qid]=String(incoming[qid]);});
  const keys=rows_('ANSWER_KEYS');let correct=0,wrong=0,blank=0,points=0,maxPoints=0;
  order.forEach(qid=>{const key=keys.find(k=>String(k.questionId)===String(qid));const weight=key?Number(key.score||1):1;maxPoints+=weight;const ans=serverAnswers[qid];if(!ans)blank++;else if(key&&String(key.correctAnswer)===String(ans)){correct++;points+=weight;}else wrong++;});
  const score=maxPoints?Math.round((points/maxPoints)*10000)/100:0,requestedSubmissionId=String(payload.submissionId||uid_('SUB'));
  // Lock hanya melindungi check+write final submit. Autosave tetap tidak memakai global lock.
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    attempt=findRowByKey_('ATTEMPTS','attemptId',payload.attemptId);
    const existing=rows_('SUBMISSIONS').find(s=>String(s.attemptId)===String(attempt.attemptId));
    if(existing)return {submissionId:String(existing.submissionId),attemptId:String(attempt.attemptId),accepted:true,alreadySubmitted:true,submittedAt:new Date(existing.submittedAt).toISOString(),result:buildResult_(existing,findRowByKey_('EXAMS','examId',attempt.examId),attempt,ctx.user.role)};
    if(String(attempt.status)!=='IN_PROGRESS')throw apiError_('Attempt tidak aktif.','ATTEMPT_CLOSED');
    const submittedAt=nowIso_();
    appendObject_('SUBMISSIONS',{submissionId:requestedSubmissionId,attemptId:attempt.attemptId,studentId:ctx.user.userId,examId:attempt.examId,answersJson:JSON.stringify(serverAnswers),score,correctCount:correct,wrongCount:wrong,blankCount:blank,submittedAt,status:'ACCEPTED'});
    updateKnownRow_('ATTEMPTS',attempt,{answersJson:JSON.stringify(serverAnswers),revision:Math.max(Number(attempt.revision||0)+1,Number(payload.revision||0)),lastSyncAt:submittedAt,status:'SUBMITTED',submittedAt});
    audit_(ctx.user.userId,'SUBMIT_EXAM',requestedSubmissionId,{attemptId:attempt.attemptId,score});
    const exam=findRowByKey_('EXAMS','examId',attempt.examId),sub=findRowByKey_('SUBMISSIONS','submissionId',requestedSubmissionId);
    return {submissionId:requestedSubmissionId,attemptId:String(attempt.attemptId),accepted:true,submittedAt,result:buildResult_(sub,exam,attempt,'student')};
  }finally{lock.releaseLock();}
}
function buildResult_(submission,exam,attempt,role){if(!submission||!exam)return null;const visibility=String(exam.resultVisibility||'hidden');const visible=role==='super_admin'||role==='teacher'||visibility==='immediate'||(visibility==='after_exam_closed'&&Date.now()>new Date(exam.endTime).getTime());return {examId:String(exam.examId),attemptId:String(attempt.attemptId),title:String(exam.title),subject:String(exam.subject),score:Number(submission.score||0),correctCount:Number(submission.correctCount||0),wrongCount:Number(submission.wrongCount||0),blankCount:Number(submission.blankCount||0),questionCount:Number(submission.correctCount||0)+Number(submission.wrongCount||0)+Number(submission.blankCount||0),submittedAt:new Date(submission.submittedAt).toISOString(),visible};}
function getResult_(payload){const ctx=requireSession_(payload.token);const attempt=findRowByKey_('ATTEMPTS','attemptId',payload.attemptId);if(!attempt)throw apiError_('Attempt tidak ditemukan.','NOT_FOUND');const exam=findRowByKey_('EXAMS','examId',attempt.examId);if(String(ctx.user.role)==='student'){if(String(attempt.studentId)!==String(ctx.user.userId))throw apiError_('Tidak diizinkan.','FORBIDDEN');}else{if(['super_admin','teacher'].indexOf(String(ctx.user.role))<0||!canManageExam_(ctx,exam))throw apiError_('Tidak diizinkan.','FORBIDDEN');}const sub=rows_('SUBMISSIONS').find(s=>String(s.attemptId)===String(attempt.attemptId));if(!sub)return null;return buildResult_(sub,exam,attempt,ctx.user.role);}
function getMyResults_(payload){const ctx=requireSession_(payload.token,'student');const attempts=rows_('ATTEMPTS').filter(a=>String(a.studentId)===String(ctx.user.userId)&&String(a.status)==='SUBMITTED');return attempts.map(a=>{const sub=rows_('SUBMISSIONS').find(s=>String(s.attemptId)===String(a.attemptId));return sub?buildResult_(sub,findRowByKey_('EXAMS','examId',a.examId),a,'student'):null;}).filter(Boolean);}
