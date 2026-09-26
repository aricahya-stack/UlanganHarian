const SM = Object.freeze({
  SHEETS: {
    USERS: ['userId','name','className','subject','username','passwordHash','passwordSalt','role','status','createdAt','updatedAt'],
    EXAMS: ['examId','ownerId','title','subject','className','startTime','endTime','durationMinutes','questionCount','status','randomizeQuestion','randomizeOption','resultVisibility','token','attemptPolicy','instructions','createdAt','updatedAt'],
    QUESTIONS: ['questionId','examId','questionText','optionA','optionB','optionC','optionD','imageFileId','questionType','difficulty','tag','status','createdAt','updatedAt'],
    ANSWER_KEYS: ['questionId','correctAnswer','score'],
    ATTEMPTS: ['attemptId','examId','studentId','startedAt','expiresAt','lastSyncAt','revision','status','submittedAt','questionOrderJson','optionOrderJson','answersJson'],
    SUBMISSIONS: ['submissionId','attemptId','studentId','examId','answersJson','score','correctCount','wrongCount','blankCount','submittedAt','status'],
    SESSIONS: ['token','userId','role','expiresAt','createdAt'],
    AUDIT_LOG: ['logId','timestamp','userId','action','targetId','detailJson']
  },
  SESSION_HOURS: 12,
  BATCH_SIZE: 10,
  CACHE_SECONDS: 120,
});
