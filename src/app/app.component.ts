
import { Component, OnInit } from '@angular/core';
import { ContentService } from 'hatool';
import { HubspotService } from './hubspot.service';
import { FileUploader } from 'hatool';

const offenderScenarios =
[
      {value: 0,
      display: 'משטרה',
      displayValue: 'משטרה',
      moreQuestions: [
        {question: 'האם בוצע מעצר במסגרת המקרה?',
         questionKey: 'מעצר',
         answers: [
           { display : 'כן, היה מעצר',
             value: 'בוצע מעצר'
           },
           { display: 'לא',
             value: 'לא בוצע מעצר'
           }
         ]
       },
       {question: 'האם הוגש כתב אישום ?',
        questionKey: 'כתב אישום',
        answers: [
          { display : 'כן, הוגש כתב אישום',
            value: 'הוגש כתב אישום'
          },
          { display: 'לא',
            value: 'לא הוגש כתב אישום'
          }
        ]
      },
      {question: 'האם הפונה כבר מיוצג/ת ע"י עו"ד?',
       questionKey: 'מיוצג/ת ע"י עו"ד',
       answers: [
         { display : 'כן, הפונה מיוצג/ת על-ידי עו"ד',
           value: 'מיוצג/ת ע"י עו"ד'
         },
         { display: 'לא',
           value: 'לא מיוצג/ת ע"י עו"ד'
         }
       ]
     },

    {question: 'האם היו עדים למקרה? אם כן, הקלידו את הפרטים',     // * should enable empty submission, in case of one details
     questionKey: 'פרטי העדים',
     answers: null
    },
    {
      question: 'פרטים חסרים לגבי האירוע: זמן, מקום, מה נאמר או נעשה שחשף את הגזענות/פרופיילינג?',
      questionKey: 'מידע נוסף',
      answers: null
    }
  ],
   askForOffenderDetails: [
     {
       question: 'האם יש פרטים של השוטר/ים או הניידת? האם הם היו מזוהים בתג או שזיהו את עצמם?',
       questionKey: 'יש/אין פרטים מזהים',
       answers: [
          {
           display: 'כן',
           value: [{
             question: 'מהם פרטי השוטר/ים?',
             question_key: 'פרטי השוטרים'
           }]
         },
         {
         value: 'אין פרטים על השוטרים המעורבים.',
         display: 'לא'
         },
        ]
      }
    ],
      supportingNGOs : [0, 1, 2]
      },

      {value: 1,
       display: 'מאבטח/ת',
       displayValue: 'מאבט/ת',

       moreQuestions: [
        {question: 'ודאו שהפרטים הבאים נמצאים בתיאור האירוע ואם לא, \
                    שאלו את הפונה לגביהם: זמן הארוע, מיקום, מה נאמר או נעשה שחשף את ההתנהגות הגזענית או הפרופיילנג',
         questionKey: 'פרטים נוספים'
      },
     {question: 'האם היו עדים למקרה? אם כן, הקלידו את הפרטים',     // * should enable empty submission, in case of one details
      questionKey: 'פרטי העדים',
      answers: null
     },
   ],
    supportingNGOs : [0, 2]
     },

      {value: 2,
        display: 'תחום המגורים',
        displayValue: 'גורם  בתחום המגורים/דיור',
        relevantRecipients: null,
      },

      {value: 3,
       display: 'עובד/ת רשות ציבורית',
       displayValue: 'עובד/ת רשות ציבורית',
       relevantRecipients: null,
      },

      {value: 4,
       display: 'עובד/ת רשות מקומית',
       displayValue: 'עובד/ת רשות מקומית',
       relevantRecipients: null,
      },

      {value: 5,
       display: 'איש/אשת מקצוע',
       displayValue: 'איש/אשת מקצוע',
       relevantRecipients: null,
      },

      {value: 6,
       display: 'עסק',
       displayValue: 'עסק',
       relevantRecipients: null,
      },

      {value: 7,
       display: 'אדם פרטי',
       displayValue: 'אדם פרטי',
       relevantRecipients: null,
      },

      {value: 8,
       display: 'other',
       displayValue: 'אחר',
       relevantRecipients: null,
     }
];


const relevantRecipientsList = [
  { value: 'מח"ש',
    display: 'המחלקה לחקירות שוטרים (מח"ש")',
    description: null,
    complaintTypes: ['התנהגות או התבטאות גזענית מצד שוטר/ת'],
    locations: [],
    offenders: []
  },
  {
   value: 'מחלקת פניות ציבור במשטרה',
   display: 'מחלקת פניות ציבור במשטרה',
   description: null,
   complaintTypes: ['התנהגות או התבטאות גזענית מצד שוטר/ת'],
   locations: [],
   offenders: []
 },
 {
   value: 'ממונה למאבק בגזענות במשרד הרלוונטי',
   display: 'ממונה למאבק בגזענות במשרד הרלוונטי',
   description: `  יש לבדוק האם ישנו/ישנה ממונה למאבק בגזענות \
                   <a href="https://www.gov.il/he/Departments/General/responsible_for_racism" target="_blank">\
                   ברשימת הממונים למאבק בגזענות במשרדי הממשלה\
                   </a>`,
   complaintTypes: [],
   locations: ['משרד ממשלתי'],
   offenders: []
  },
  {
    value: 'מחלקת האבטחה והרישוי במשטרת ישראל',
    display: 'מחלקת האבטחה והרישוי במשטרת ישראל',
    description: `ניתן לפנות בנוגע למאבטחים ספציפיים למחלקת האבטחה והרישוי במשטרת ישראל בהתאם לנוהל המשטרתי מס' 90.028.143 "שלילת סמכות לשמש
                  כמאבטח בגופים המונחים", עם העתק לחברת האבטחה ולגוף האבטחה הרלוונטי (המשרד הממשלתי, הקניון וכו').`,
    complaintTypes : [],
    locations: [],
    offenders: ['מאבטח/ת']
  },
  {
    value: 'מחלקת האבטחה והרישוי במשטרת ישראל',
    display: 'מחלקת האבטחה והרישוי במשטרת ישראל',
    description: `תלונה לגבי מדיניות אבטחה: תלונה למחלקת האבטחה והרישוי במשטרת ישראל עם העתק לחברת האבטחה ולגוף האבטחה הרלוונטי`,
    complaintTypes : ['מניעת כניסה'],
    locations: [],
    offenders: []
  }
 ];

const ngos = [
  {
    code: 0,
    name: 'המרכז לנפגעי גזענות (התנועה הרפורמית): מוקד מידע, סיוע וליווי משפטי',
    description: `המרכז לנפגעי גזענות", מוקד\
        מידע, סיוע ותיעוד שיילחם בגזענות בישראל באמצעות העצמת נפגעי גזענות, ויציע ליווי מול הרשויות,\
        סיוע משפטי וסיוע נפשי כדי להקל על הגישה לאוכלוסיות הנפגעות. <br><br>\
        שעות‭ ‬פעילות‭ ‬הקו‭:‬ <br>
        שני‭ ‬13\:00-17:00‭ ‬<br>
        שישי‭ ‬9\:00-13:00‭ ‬<br>
        בשאר‭ ‬הזמן‭ ‬ניתן‭ ‬להשאיר‭ ‬הודעה `,
    moreinfo: {website: 'https://www.ircc.org.il/'},
    contacts:
      {email: 'stop.racism@ircc.org.il', phone: '1-700-704-408', website: 'https://www.ircc.org.il/'}

  },
  {
    code: 1,
    name: 'הועד נגד עינויים',
    description: 'הוועד פועל למען בני אדם באשר הם -\
     ישראלים, פלסטינים, מהגרי עבודה ואזרחים\
      זרים נוספים, השוהים בישראל ובשטחים הכבושים\
      , במטרה להגן עליהם מפני עינויים והתעללויות שנוקטות רשויות האכיפה והחקירה הישראליות, כלומר: משטרת\
       ישראל, שירות הביטחון הכללי, שירות בתי הסוהר וצה"ל.',
    moreinfo: {website: 'http://stoptorture.org.il/'},
    contacts:
      {email: null, phone: null, website: 'http://stoptorture.org.il/'}

  },
  {
    code: 2,
    name: 'עדאלה',
    description: '',
    moreinfo: {website: 'https://www.adalah.org/he'},
    contacts:
      {email: null, phone: null, website: 'https://www.adalah.org/he'}

  }
];


@Component({
  selector: 'app-root',
  template: '<htl-hatool></htl-hatool>',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'hatool';

  constructor(private content: ContentService,
              private hubspot: HubspotService) {}
  ngOnInit() {
        this.content.sendButtonText = 'שלח/י';

        this.content.uploadFileText = 'לחצ/י לבחירת קובץ';
        this.content.uploadedFileText = 'קובץ הועלה בהצלחה';
        this.content.notUploadedFileText = 'תקלה בהעלאת קובץ';
        this.doIt();
      }

  async doIt() {

    //   service person side
    const vid = window.location.search.slice(1).split('&')[0].split('=')[1];
    const userInfo: any = await this.hubspot.getUser(vid);

    const hubSpotContact: any = {};
    this.hubspot.vid = vid;
    let summary = '';
    const name = userInfo.full_name;

    const userEmail = userInfo.email;
    const userWhatsapp = userInfo.whatsapp;
    const userPhone = userInfo.phone;
    const userFacebook = userInfo.facebook;

    const complaintType = userInfo.complaint_type ? userInfo.complaint_type.trim() : null ;
    let eventDescription = userInfo.event_description;        // we will update the event Description during the process
    const requiredService = userInfo.required_service;
    const offender = userInfo.offender;
    const offenderIndex = userInfo.offender_code;

    const eventLocation = userInfo.event_location ? userInfo.event_location.trim() : null;
    const startDate = new Date(parseInt(userInfo.createdate, 10)).toISOString().slice(0, 10);
    const modifiedDate = new Date(parseInt(userInfo.lastmodifieddate, 10)).toISOString().slice(0, 10);

    let resourceIndex = 0;                                                // wrap event uploaded files/resources and count them
    const filesObject = {};
    for (const key in userInfo) {
        if (key.indexOf('file') > -1) {
          filesObject[key] = userInfo[key];
          if (key.indexOf('description') === -1) {
            resourceIndex += 1;
          }
        }
      }

    console.log('resourceIndex', resourceIndex);
    console.log('files', filesObject);

    const contact = {'email': '', 'phone': '', 'whatsapp': '', 'facebook': ''};  // wrap contact details
    Object.keys(contact).forEach((key) => {
                                            if (key in userInfo) {
                                              contact[key] = userInfo[key];
                                            }
                                          }
                                  );
    const files = {};

    let currentSavedFiles = '';                                               // stringify list of saved files descriptions
    for (let fileIndex = 1; fileIndex <= 5; fileIndex++) {                    // wrap uploaded file info, up to 5 files
      const filePointer = `file${fileIndex}`;
      const fileDescripionString = `file${fileIndex}description`;

      if (userInfo[filePointer] !== undefined && userInfo[fileDescripionString] !== undefined) {
        files[fileIndex] = {'description': userInfo[fileDescripionString], 'path': userInfo[filePointer]};
        currentSavedFiles += `${fileIndex}. ${userInfo[fileDescripionString]} <br>`;
      }
    }


    this.content.addTo('[מעבר למוקדנ/ית - המידע מכאן והלאה יוצג במערכת ההנחיה למוקד/נית שיתקשר אותו מול הפונה במדיום שבחרו]');
    this.content.addTo(`עברו על פרטי המקרה <br><br>
                        שם הפונה: ${name} <br><br>
                        אמצעי יצירת קשר: <br>
                        ---------------- <br>
                          ${userPhone ? 'מספר טלפון: ' + userPhone + ',<br>' : ''}
                          ${userWhatsapp ? 'וואטסאפ: ' + userWhatsapp + ',<br>' : ''}
                          ${userFacebook ? 'פייסבוק: ' + userFacebook + ',<br>' : ''}
                          ${userEmail ? 'אימייל: ' + userEmail + ',<br>' : ''}
                        <br><br>
                        סוג התלונה: ${complaintType} <br>
                        הגורם הפוגע: ${offender} <br><br>
                        תיאור המקרה: <br>
                         ${eventLocation ? 'מיקום האירוע: ' + eventLocation + ', <br>' : ''}
                        ------------ <br>
                          ${eventDescription.replace('\\n', '<br>')} <br><br>
                        השירות שביקש/ה: ${requiredService} <br><br>
                        תאריך הפניה הראשונה: ${startDate}<br>
                        תאריך עדכון אחרון: ${modifiedDate}
                      `);


    let filesString = '';

    for (let fileIndex = 1; fileIndex <= resourceIndex; fileIndex++) {
      const fileIndexString = fileIndex.toString();
      const fileDescriptionKey = `file${fileIndexString}description`;
      const fileKey = `file${fileIndexString}`;
      filesString += `<a href="${filesObject[fileKey]}" target="_blank">${filesObject[fileDescriptionKey]}</a><br>`;
    }

    if (resourceIndex > 0) {
      this.content.addTo(` הפונה צירפ/ה ${resourceIndex} קבצים לפניה: <br>
        ${filesString}
        `);
    }

    this.content.addTo(`חזרו אל הפונה באמצעי הקשר שבחרו:
                        "שלום ${name}, אני חוזר/ת אליך בהמשך לפניה שלך מ-${startDate}, בנוגע ל${requiredService} על ארוע של
                         ${complaintType}, שבוצעה על ידי ${offender}.
                        על מנת שאוכל לסייע לך יש לי עוד מספר שאלות."`);

    const offenderScenario = offenderScenarios[offenderIndex];          // pull the relevant scenario

    switch (offenderIndex) {
      case '0':

        if ('moreQuestions' in offenderScenario) {
          const moreQuestions = offenderScenario['moreQuestions'];
          const answers = Array();

          this.content.addTo(`השלימו את הפרטים הבאים בבירור עם הפונה:`);

          for (let questionIndex = 1; questionIndex <= moreQuestions.length; questionIndex++) { // add more details to event_description
            const questionObject = moreQuestions[questionIndex - 1];
            const question = `${questionIndex}. ${questionObject.question}`;
            const questionKey = questionObject.questionKey;

            if ('answers' in questionObject && questionObject.answers != null) {
              this.content.addOptions(question, questionObject.answers);
            } else {
              this.content.addTo(question);
              this.content.setTextArea();
            }
            const newAnswer = await this.content.waitForInput();
            answers.push({'key': questionKey, 'detail': newAnswer});

          }

          const moreDetails = answers.map(e => (e.key + ': ' + e.detail)).join(', ');
          eventDescription += `\nפרטים נוספים:\n ${moreDetails}`;
          summary += `פרטים נוספים לתיאור המקרה: <br>${moreDetails}<br>`;
          hubSpotContact.event_description = eventDescription;

          await this.hubspot.updateUser(hubSpotContact);
          console.log(`updated event details: ${userInfo.event_description}`);

        }

        if ('askForOffenderDetails' in offenderScenario) {   // check if we should ask optional offender details quetsion
          let answers;
          const offenderDetails = [];
          const offenderDetailsQuestions = offenderScenario.askForOffenderDetails;
          for (let questionIndex = 0; questionIndex <= offenderDetailsQuestions.length - 1; questionIndex++) {

            const questionObject = offenderDetailsQuestions[questionIndex];
            const question = questionObject.question;

            if ('answers' in questionObject) {                               // what is the type of the question: options / open question
              this.content.addOptions(question,  questionObject.answers);
              } else {
              this.content.addTo(question);
              this.content.setTextArea();
            }
            const answer = await this.content.waitForInput();

            if (typeof answer === 'object') {                                        // check if we need to handle a follow-up question
              const followUpQuestions = answer;
              for (let followUpQuestionIndex = 0; followUpQuestionIndex <= followUpQuestions.length - 1; followUpQuestionIndex++) {
                const newQuestion = followUpQuestions[followUpQuestionIndex].question;
                const question_key = followUpQuestions[followUpQuestionIndex].question_key;

                this.content.addTo(newQuestion);
                this.content.setTextArea();

                const newAnswer = await this.content.waitForInput();
                offenderDetails.push({'key': question_key, 'detail': newAnswer});

              }
              answers = offenderDetails.map(e => (e.key + ': ' + e.detail)).join(', ');
            } else {
              answers = answer;
            }
          }
        summary += `<br> ${answers} <br>`;
        hubSpotContact.offender_person_details = answers;
        await this.hubspot.updateUser(hubSpotContact);
        console.log(`update offender_person_details: ${hubSpotContact.offender_person_details}`);

      }


      if (resourceIndex < 5) {                       // uploaded files limit, following the CRM fields settings
        let moreResourcesUpload = true;

          this.content.addTo(`כרגע שמורים במערכת ${resourceIndex} קבצים: <br>
            ${currentSavedFiles} <br>
             ניתן להעלות ${5 - resourceIndex} קבצים נוספים.`);
        while (moreResourcesUpload && resourceIndex <= 5) {                       // uploaded files limit, following the CRM fields settings
          this.content.addOptions(
            `האם יש בידי הפונה עוד צילומים, מסמכים או תיעוד של המקרה שיוכלו להעביר לנו כעת? <br>\
              אם כן, תתבקשו לקבל מהם את הקובץ ולהעלות אותם.`,
              [
                {value: true, display: 'כן'},
                {value: false, display: 'לא'}
              ]);

          moreResourcesUpload = await this.content.waitForInput();

          if (moreResourcesUpload) {
            this.content.addUploader('אנא בחר/י את הקובץ הרלוונטי');
            const file: FileUploader = await this.content.waitForInput();
            file.active = true;
            const uploaded = await this.hubspot.uploadFile(
              file.selectedFile, this.hubspot.vid + '/file-' + resourceIndex,
              (progress) => { file.progress = progress; },
              (success) => { file.success = success; }
              );
            console.log('UPLOADED', uploaded);
            hubSpotContact['file' + resourceIndex] = uploaded;
            files['file' + resourceIndex] = uploaded;

            this.content.addTo('מה יש בקובץ ששלחתם?');

            const resouceDescription = await this.content.waitForInput();
            hubSpotContact['file' + resourceIndex + 'description'] = resouceDescription;
            files['file' + resourceIndex + 'description'] = resouceDescription;

            summary += `<br> הועלה קובץ חדש: ${resouceDescription}.`;
            this.hubspot.updateUser(hubSpotContact);

            resourceIndex += 1;
            }
          }
        }

        this.content.addOptions(                                   // check if details enable complaint
                      `האם המידע הקיים מאפשר ${requiredService} בעקבות הארוע?`,
                      [{ value: true, display: 'כן'},
                       { value: false, display: 'לא' },
                      ]);

        let canBeServed = await this.content.waitForInput();
        if (requiredService === 'הגשת תלונה') {
          const wantsTocomplain = true;
        } else {
          const wantsTocomplain = false;
        }

        hubSpotContact.can_service = canBeServed;
        await this.hubspot.updateUser(hubSpotContact);

        this.content.addFrom(canBeServed  ? 'כן' : 'לא');

        console.log(`updated can_service value: ${hubSpotContact.can_service}`);

              if (canBeServed) {                                                    // if can complain thread and user wants to complain
                summary += `<br>המקרה מאפשר ${requiredService}<br>`;
                let relevantRecipientsOptions = relevantRecipientsList.filter((org) => org.locations.indexOf(eventLocation) > -1);
                relevantRecipientsOptions = relevantRecipientsOptions.concat(relevantRecipientsList.filter((org) =>
                  org.complaintTypes.indexOf(complaintType) > -1 ));
                relevantRecipientsOptions = relevantRecipientsOptions.concat(relevantRecipientsList.filter((org) =>
                    org.offenders.indexOf(offender) > -1 ));

                if (relevantRecipientsOptions.length === 0) {
                    this.content.addTo('לא נמצא במערכת מידע לגבי\
                     הגופים להם ניתן לדווח על המקרה. עדכנו את הפונה שתבררו מה האפשרויות ותעדכנו אותו/אותה בהמשך');
                } else {
                    const approvedReciepents = [];
                    this.content.addTo(`ניתן לשלוח את התלונה ל-${relevantRecipientsOptions.length} גורמים.\
                       <br> אני אגיד לך מהם, כדי שתוכל/י להגיד לי למי מהם תרצה/תרצי לפנות:`);

              for (let relevantRecipientsIndex = 0;
                        relevantRecipientsIndex <= relevantRecipientsOptions.length - 1; relevantRecipientsIndex++) {
                      const recipient = relevantRecipientsOptions[relevantRecipientsIndex];
                      this.content.addOptions(`ניתן לפנות בנוגע למקרה הזה אל ${recipient.display}. <br>\
                                                ${recipient.description ? '<br>פרטים נוספים: ' + recipient.description + '<br>' : ''}\
                                                האם תרצו שנסייע לכם ב${requiredService} אליהם?`,
                                              [
                                               { display : 'כן', value : true},
                                               { display : 'לא', value : false}
                                             ]);
                      const sendToRecipient = await this.content.waitForInput();
                      if (sendToRecipient) {
                        approvedReciepents.push(recipient);
                      }
                    }

                    const sendReportTo = approvedReciepents.map((org) => org.display).join(', ');  // unify list of compaint recievers
                    summary += `<br>הפונה מעוניינ/ת לפנות ל${sendReportTo}.<br>`;
                    hubSpotContact.send_complaint_to = sendReportTo;

                    await this.hubspot.updateUser(hubSpotContact);
                    console.log(`updated send_complaint_to: ${hubSpotContact.send_complaint_to}`);


                    if (sendReportTo.length > 0 ) {                           // if user wants help delivering complaint
                      this.content.addTo(`ענו לפונה: <br />
                                    "בסדר גמור. אני אחזור אליך עם הצעה לנוסח הפניה ועם הסבר איך שולחים את התלונה"
                                    `);
                                  }

                  }

                } else {
                    summary += `<br>התברר שהמקרה אינו מאפשר ${requiredService}<br>`;
                }                            // end of "Can be served" part
                                              // * should consider what/how to handle call that can not be served
                                                // check if user want to share detais with other NGOs
            let ngosToShareWith = '';
            let ngosSendContactsToUser = '';

            const supportingNGOs = offenderScenario.supportingNGOs.map((code) => ngos[code]);
            if (supportingNGOs.length > 0) {             // if there are relevant NGOs to share data with

              this.content.addTo(`
                עדכנו את הפונה: <br />
                ישנם ארגוני חברה אזרחית שיוכלו אולי לסייע לך במקביל לפניה לגופים הממשלתיים. <br>
                אלה אינם גורמים מטעם המדינה, אלא ארגונים עצמאים. אני אציג בפניך כמה אפשרויות, כדי שתוכל/י
                להכיר אותם ולחשוב אם תרצה/תרצי לנסות להיעזר בהם:<br><br>`);

              for (let orgIndex = 0; orgIndex <= supportingNGOs.length - 1 ; orgIndex++) {
                const org = supportingNGOs[orgIndex];
                this.content.addOptions(`הארגון ${org.name} ${org.description ? ': ' + org.description : ''}<br><br>
                                    ${org.moreinfo.website ? '<a href="' + org.moreinfo.website + '" \
                                            target="_blank">מידע נוסף על הארגון</a><br>' : ''}
                                            `,
                                    [
                                      {
                                        value: 'share with ngo',
                                        display: 'הפונה מאשר/ת לשתף את המידע לגבי התלונה עם הארגון'
                                      },
                                      {
                                        value: 'asked for contacts',
                                        display: 'הפונה מעוניינ/ת לקבל מידע ופרטי הקשרות עם הארגון ויצור עמם קשר עצמאית'},
                                      {
                                        value: false,
                                        display: 'הפונה אינו/אינה מעוניינת בקשר עם הארגון'
                                      }
                                    ]
                                  );

                  const answer = await this.content.waitForInput();
                  if (answer === 'share with ngo') {
                    ngosToShareWith = `${org.name}: ${org.contacts.phone ? 'טלפון: ' + org.contacts.phone + '\n' : ''}
                                  ${org.contacts.website ? 'אתר מידע: <a href="' +
                                     org.contacts.website + '" target="_blank">' + org.contacts.website + '</a>' : '' }
                                  ${org.contacts.email ? 'אימייל: ' + org.contacts.email + '\n' : ''}
                                  `;
                    summary += `<br>הפונה ביקש/ה לשתף את המידע לגבי הפניה עם הארגון ${org.name} <br>
                    פרטי התקשרות: ${org.contacts.phone ? 'טלפון: ' + org.contacts.phone + '<br>' : ''}
                    ${org.contacts.website ? 'אתר מידע: <a href="' +
                    org.contacts.website + '" target="_blank">' + org.contacts.website + '</a><br>' : '' }
                    ${org.contacts.email ? 'אימייל: ' + org.contacts.email + '</a><br>' : ''}
                    .<br>`;
                  } else if (answer === 'asked for contacts') {
                    ngosSendContactsToUser = `${org.name}: ${org.contacts.phone ? 'טלפון: ' + org.contacts.phone + '\n' : ''}
                    ${org.contacts.website ? 'אתר מידע: <a href="' +
                    org.contacts.website + '" target="_blank">' + org.contacts.website + '</a>' : '' }
                    ${org.contacts.email ? 'אימייל: ' + org.contacts.email + '\n' : ''}`;

                    summary += `הפונה ביקש/ה לקבל את פרטי הקשר עם הארגון ${org.name} <br>
                    פרטי התקשרות: ${org.contacts.phone ? 'טלפון: ' + org.contacts.phone + '<br>' : ''}
                    ${org.contacts.website ? 'אתר מידע: <a href="' +
                    org.contacts.website + '" target="_blank">' + org.contacts.website + '</a><br>' : '' }
                    ${org.contacts.email ? 'אימייל: ' + org.contacts.email + '</a><br>' : ''}
                    .<br><br>
                    `;
                  }
              }


              this.content.addOptions(`היחידה הממשלתית לתיאום המאבק בגזענות אוספת מידע ונתונים בנוגע למקרים של גזענות'
                ' ממסדית בניסיון להלחם בתופעה. האם תסכימו שנעביר להם את פרטי המקרה?`,
                [
                  {
                    value: 'מאשר/ת להעביר את כל הפרטים ליחידה לתיאום המאבק בגזענות',
                    display: 'כן, הפונה מאשר/ת להעביר את כל הפרטים ליחידה לתיאום המאבק בגזענות'
                  },
                  {
                    value: 'מאשר להעביר את המקרה בצורה אנונימית, ללא פרטים מזהים, ליחידה לתיאום המאבק בגזענות',
                    display: 'הפונה מאשר/ת להעביר את פרטי המקרה ליחידה לתיאום המאבק בגזענות, ללא פרטים מזהים',
                  },
                  {
                    value: 'לא מאשר/ת להעביר את פרטי הארוע ליחידה לתיאום המאבק בגזענות',
                    display: 'הפונה אינו מאשרת להעביר את פרטי המקרה ליחידה לתיאום המאבק בגזענות'
                  }
                ]
              );

              const sendToJusticeMinistry = await this.content.waitForInput();
              console.log(sendToJusticeMinistry);
              hubSpotContact.justice_ministry_send = sendToJusticeMinistry;
              await this.hubspot.updateUser(hubSpotContact);
              summary += `העברת המידע ליחידה הממשלתית לתיאום המאבק בגזענות: ${sendToJusticeMinistry}`;
              console.log(`Updated justice_ministry_send: ${sendToJusticeMinistry}`);

              hubSpotContact.share_data_with_orgs = ngosToShareWith;
              hubSpotContact.ngo_contacts_to_user = ngosSendContactsToUser;
              await this.hubspot.updateUser(hubSpotContact);
              console.log(`updated ngos shares and contacts requests`);

            }
      this.content.addTo(`סיכום השיחה: <br />
                          ${summary}
                        `);
      summary = summary.replace(/(<br>|<\/br>|<br \/>)/mgi, '\n');
      hubSpotContact.status_summary = summary;
      await this.hubspot.updateUser(hubSpotContact);
      console.log(`updated summary on db: ${summary}`);
    break;

    case '1':

      if ('moreQuestions' in offenderScenario) {
        const moreQuestions = offenderScenario['moreQuestions'];
        const answers = Array();

        this.content.addTo(`השלימו את הפרטים הבאים בבירור עם הפונה:`);

        for (let questionIndex = 1; questionIndex <= moreQuestions.length; questionIndex++) { // add more details to event_description
          const questionObject = moreQuestions[questionIndex - 1];
          const question = `${questionIndex}. ${questionObject.question}`;
          const questionKey = questionObject.questionKey;

          if ('answers' in questionObject && questionObject.answers != null) {
            this.content.addOptions(question, questionObject.answers);
          } else {
            this.content.addTo(question);
            this.content.setTextArea();
          }
          const newAnswer = await this.content.waitForInput();
          answers.push({'key': questionKey, 'detail': newAnswer});

        }

        const moreDetails = answers.map(e => (e.key + ': ' + e.detail)).join(', ');
        eventDescription += `\nפרטים נוספים:\n ${moreDetails}`;
        summary += `פרטים נוספים לתיאור המקרה: <br>${moreDetails}<br>`;
        hubSpotContact.event_description = eventDescription;

        await this.hubspot.updateUser(hubSpotContact);
        console.log(`updated event details: ${userInfo.event_description}`);

      }

      if ('askForOffenderDetails' in offenderScenario) {   // check if we should ask optional offender details quetsion
        let answers;
        const offenderDetails = [];
        const offenderDetailsQuestions = offenderScenario.askForOffenderDetails;
        for (let questionIndex = 0; questionIndex <= offenderDetailsQuestions.length - 1; questionIndex++) {

          const questionObject = offenderDetailsQuestions[questionIndex];
          const question = questionObject.question;

          if ('answers' in questionObject) {                               // what is the type of the question: options / open question
            this.content.addOptions(question,  questionObject.answers);
            } else {
            this.content.addTo(question);
            this.content.setTextArea();
          }
          const answer = await this.content.waitForInput();

          if (typeof answer === 'object') {                                        // check if we need to handle a follow-up question
            const followUpQuestions = answer;
            for (let followUpQuestionIndex = 0; followUpQuestionIndex <= followUpQuestions.length - 1; followUpQuestionIndex++) {
              const newQuestion = followUpQuestions[followUpQuestionIndex].question;
              const question_key = followUpQuestions[followUpQuestionIndex].question_key;

              this.content.addTo(newQuestion);
              this.content.setTextArea();

              const newAnswer = await this.content.waitForInput();
              offenderDetails.push({'key': question_key, 'detail': newAnswer});

            }
            answers = offenderDetails.map(e => (e.key + ': ' + e.detail)).join(', ');
          } else {
            answers = answer;
          }
        }
      summary += `<br> ${answers} <br>`;
      hubSpotContact.offender_person_details = answers;
      await this.hubspot.updateUser(hubSpotContact);
      console.log(`update offender_person_details: ${hubSpotContact.offender_person_details}`);

    }


    if (resourceIndex < 5) {                       // uploaded files limit, following the CRM fields settings
      let moreResourcesUpload = true;

        this.content.addTo(`כרגע שמורים במערכת ${resourceIndex} קבצים: <br>
          ${currentSavedFiles} <br>
           ניתן להעלות ${5 - resourceIndex} קבצים נוספים.`);
      while (moreResourcesUpload && resourceIndex <= 5) {                       // uploaded files limit, following the CRM fields settings
        this.content.addOptions(
          `האם יש בידי הפונה עוד צילומים, מסמכים או תיעוד של המקרה שיוכלו להעביר לנו כעת? <br>\
            אם כן, תתבקשו לקבל מהם את הקובץ ולהעלות אותם.`,
            [
              {value: true, display: 'כן'},
              {value: false, display: 'לא'}
            ]);

        moreResourcesUpload = await this.content.waitForInput();

        if (moreResourcesUpload) {
          this.content.addUploader('אנא בחר/י את הקובץ הרלוונטי');
          const file: FileUploader = await this.content.waitForInput();
          file.active = true;
          const uploaded = await this.hubspot.uploadFile(
            file.selectedFile, this.hubspot.vid + '/file-' + resourceIndex,
            (progress) => { file.progress = progress; },
            (success) => { file.success = success; }
            );
          console.log('UPLOADED', uploaded);
          hubSpotContact['file' + resourceIndex] = uploaded;
          files['file' + resourceIndex] = uploaded;

          this.content.addTo('מה יש בקובץ ששלחתם?');

          const resouceDescription = await this.content.waitForInput();
          hubSpotContact['file' + resourceIndex + 'description'] = resouceDescription;
          files['file' + resourceIndex + 'description'] = resouceDescription;

          summary += `<br> הועלה קובץ חדש: ${resouceDescription}.`;
          this.hubspot.updateUser(hubSpotContact);

          resourceIndex += 1;
          }
        }
      }

      this.content.addOptions(                                   // check if details enable complaint
                    `האם המידע הקיים מאפשר ${requiredService} בעקבות הארוע?`,
                    [{ value: true, display: 'כן'},
                     { value: false, display: 'לא' },
                    ]);

      const canBeServed = await this.content.waitForInput();
      if (requiredService === 'הגשת תלונה') {
        const wantsTocomplain = true;
      } else {
        const wantsTocomplain = false;
      }

      hubSpotContact.can_service = canBeServed;
      await this.hubspot.updateUser(hubSpotContact);

      this.content.addFrom(canBeServed  ? 'כן' : 'לא');

      console.log(`updated can_service value: ${hubSpotContact.can_service}`);


      if (canBeServed) {                                                    // if can complain thread and user wants to complain
        summary += `<br>המקרה מאפשר ${requiredService}<br>`;
        let relevantRecipientsOptions = relevantRecipientsList.filter((org) => org.locations.indexOf(eventLocation) > -1);
        relevantRecipientsOptions = relevantRecipientsOptions.concat(relevantRecipientsList.filter((org) =>
          org.complaintTypes.indexOf(complaintType) > -1 ));
        relevantRecipientsOptions = relevantRecipientsOptions.concat(relevantRecipientsList.filter((org) =>
            org.offenders.indexOf(offender) > -1 ));

        if (relevantRecipientsOptions.length === 0) {
            this.content.addTo('לא נמצא במערכת מידע לגבי\
             הגופים להם ניתן לדווח על המקרה. עדכנו את הפונה שתבררו מה האפשרויות ותעדכנו אותו/אותה בהמשך');
        } else {
            const approvedReciepents = [];
            this.content.addTo(`ניתן לשלוח את התלונה ל-${relevantRecipientsOptions.length} גורמים.\
               <br> אני אגיד לך מהם, כדי שתוכל/י להגיד לי למי מהם תרצה/תרצי לפנות:`);

      for (let relevantRecipientsIndex = 0; relevantRecipientsIndex <= relevantRecipientsOptions.length - 1; relevantRecipientsIndex++) {
              const recipient = relevantRecipientsOptions[relevantRecipientsIndex];
              this.content.addOptions(`ניתן לפנות בנוגע למקרה הזה אל ${recipient.display}. <br>\
                                       ${recipient.description ? '<br>פרטים נוספים: ' + recipient.description + '<br>' : ''}\
                                        האם תרצו שנסייע לכם ב${requiredService} אליהם?`,
                                      [
                                       { display : 'כן', value : true},
                                       { display : 'לא', value : false}
                                     ]);
              const sendToRecipient = await this.content.waitForInput();
              if (sendToRecipient) {
                approvedReciepents.push(recipient);
              }
            }

            let sendReportTo = approvedReciepents.map((org) => org.display).join(', ');  // unify list of compaint recievers
            summary += `<br>הפונה מעוניינ/ת לפנות ל${sendReportTo}.<br>`;
            hubSpotContact.send_complaint_to = sendReportTo;

            await this.hubspot.updateUser(hubSpotContact);
            console.log(`updated send_complaint_to: ${hubSpotContact.send_complaint_to}`);


            if (sendReportTo.length > 0 ) {                           // if user wants help delivering complaint
              this.content.addTo(`ענו לפונה: <br />
                            "בסדר גמור. אני אחזור אליך עם הצעה לנוסח הפניה ועם הסבר איך שולחים את התלונה"
                            `);
                          }

          }

        } else {
            summary += `<br>התברר שהמקרה אינו מאפשר ${requiredService}<br>`;
        }                            // end of "Can be served" part
                                      // * should consider what/how to handle call that can not be served
                                        // check if user want to share detais with other NGOs


          this.content.addOptions(`האם לדעתך המקרה עומד בתנאים לאחד ממסלולי התביעה הנזיקית הבאים? <br>
             1. לפי חוק אפליה בשירותים ובמוצרים: ככל שפעולת המאבטח גרמה להפליה בהספקת מוצר או שירות ציבורי או במתן כניסה למקום ציבורי\
              מחמת גזע, דת, לאום וכו', ניתן לתבוע לפי החוק וביהמ"ש רשאי לפסוק 50 אלף ₪ פיצוי ללא הוכחת נזק. <br>
             2.  במקרים שבהם מאבטח השפיל אדם בהתבטאות או באופן ביצוע הבידוק או הפעלת סמכויותיו על רקע מוצאו, לאום\
              וכו' – במיוחד כאשר המקרה ארע בפומבי וכשקיימת עדות ברורה לקיומה של גזענות. <br>
            <br><br>`,
            [
              {value: 'לבדוק אפשרות לתביעה על פי חוק אפליה בשירותים ובמוצרים ללא הוכחת נזק עם עו"ד נזיקי או מרכז תמורה, טלפון: 03-9634194.',
               display: '1. תביעה נזיקית ללא הוכחת נזק'
             },
            {
              value: 'לבדוק אפשרות לתביעה נזיקית במקרים בעלי רקע פומבי, בהם קיימת עדות ברורה \
                    למניעים של גזענות ו/או השפלה עם עו"ד נזיקי או עם מרכז "תמורה", טלפון: 03-9634194.',
              display: '2. תביעה נזיקית אחרת'
            },
            {
              value: null,
              display: '3. לא, אין עילה לתביעת נזיקין'
            }
          ]
        );

        const tortClaim = await this.content.waitForInput();
        if (tortClaim) {
          sendReportTo += `, ${tortClaim}`;
          hubSpotContact.send_complaint_to = sendReportTo;

          await this.hubspot.updateUser(hubSpotContact);
          console.log(`updated send_complaint_to: ${hubSpotContact.send_complaint_to}`);

          summary += `<br>הפונה בחר/ה לבדוק ${tortClaim}<br>`;
        }

          let ngosToShareWith = '';
          let ngosSendContactsToUser = '';

          const supportingNGOs = offenderScenario.supportingNGOs.map((code) => ngos[code]);
          if (supportingNGOs.length > 0) {             // if there are relevant NGOs to share data with

            this.content.addTo(`
              עדכנו את הפונה: <br />
              ישנם ארגוני חברה אזרחית שיוכלו אולי לסייע לך במקביל לפניה לגופים הממשלתיים. <br>
              אלה אינם גורמים מטעם המדינה, אלא ארגונים עצמאים. אני אציג בפניך כמה אפשרויות, כדי שתוכל/י
              להכיר אותם ולחשוב אם תרצה/תרצי לנסות להיעזר בהם:<br><br>`);

            for (let orgIndex = 0; orgIndex <= supportingNGOs.length - 1 ; orgIndex++) {
              const org = supportingNGOs[orgIndex];
              this.content.addOptions(`הארגון ${org.name} ${org.description ? ': ' + org.description : ''}<br><br>
                                  ${org.moreinfo.website ? '<a href="' + org.moreinfo.website + '" \
                                          target="_blank">מידע נוסף על הארגון</a><br>' : ''}
                                          `,
                                  [
                                    {
                                      value: 'share with ngo',
                                      display: 'הפונה מאשר/ת לשתף את המידע לגבי התלונה עם הארגון'
                                    },
                                    {
                                      value: 'asked for contacts',
                                      display: 'הפונה מעוניינ/ת לקבל מידע ופרטי הקשרות עם הארגון ויצור עמם קשר עצמאית'},
                                    {
                                      value: false,
                                      display: 'הפונה אינו/אינה מעוניינת בקשר עם הארגון'
                                    }
                                  ]
                                );

                const answer = await this.content.waitForInput();
                if (answer === 'share with ngo') {
                  ngosToShareWith = `${org.name}: ${org.contacts.phone ? 'טלפון: ' + org.contacts.phone + '\n' : ''}
                                ${org.contacts.website ? 'אתר מידע: <a href="' +
                                   org.contacts.website + '" target="_blank">' + org.contacts.website + '</a>' : '' }
                                ${org.contacts.email ? 'אימייל: ' + org.contacts.email + '\n' : ''}
                                `;
                  summary += `<br>הפונה ביקש/ה לשתף את המידע לגבי הפניה עם הארגון ${org.name} <br>
                  פרטי התקשרות: ${org.contacts.phone ? 'טלפון: ' + org.contacts.phone + '<br>' : ''}
                  ${org.contacts.website ? 'אתר מידע: <a href="' +
                  org.contacts.website + '" target="_blank">' + org.contacts.website + '</a><br>' : '' }
                  ${org.contacts.email ? 'אימייל: ' + org.contacts.email + '</a><br>' : ''}
                  .<br>`;
                } else if (answer === 'asked for contacts') {
                  ngosSendContactsToUser = `${org.name}: ${org.contacts.phone ? 'טלפון: ' + org.contacts.phone + '\n' : ''}
                  ${org.contacts.website ? 'אתר מידע: <a href="' +
                  org.contacts.website + '" target="_blank">' + org.contacts.website + '</a>' : '' }
                  ${org.contacts.email ? 'אימייל: ' + org.contacts.email + '\n' : ''}`;

                  summary += `הפונה ביקש/ה לקבל את פרטי הקשר עם הארגון ${org.name} <br>
                  פרטי התקשרות: ${org.contacts.phone ? 'טלפון: ' + org.contacts.phone + '<br>' : ''}
                  ${org.contacts.website ? 'אתר מידע: <a href="' +
                  org.contacts.website + '" target="_blank">' + org.contacts.website + '</a><br>' : '' }
                  ${org.contacts.email ? 'אימייל: ' + org.contacts.email + '</a><br>' : ''}
                  .<br><br>
                  `;
                }
            }


            this.content.addOptions(`היחידה הממשלתית לתיאום המאבק בגזענות אוספת מידע ונתונים בנוגע למקרים של גזענות'
              ' ממסדית בניסיון להלחם בתופעה. האם תסכימו שנעביר להם את פרטי המקרה?`,
              [
                {
                  value: 'מאשר/ת להעביר את כל הפרטים ליחידה לתיאום המאבק בגזענות',
                  display: 'כן, הפונה מאשר/ת להעביר את כל הפרטים ליחידה לתיאום המאבק בגזענות'
                },
                {
                  value: 'מאשר להעביר את המקרה בצורה אנונימית, ללא פרטים מזהים, ליחידה לתיאום המאבק בגזענות',
                  display: 'הפונה מאשר/ת להעביר את פרטי המקרה ליחידה לתיאום המאבק בגזענות, ללא פרטים מזהים',
                },
                {
                  value: 'לא מאשר/ת להעביר את פרטי הארוע ליחידה לתיאום המאבק בגזענות',
                  display: 'הפונה אינו מאשרת להעביר את פרטי המקרה ליחידה לתיאום המאבק בגזענות'
                }
              ]
            );

            const sendToJusticeMinistry = await this.content.waitForInput();
            console.log(sendToJusticeMinistry);
            hubSpotContact.justice_ministry_send = sendToJusticeMinistry;
            await this.hubspot.updateUser(hubSpotContact);
            summary += `העברת המידע ליחידה הממשלתית לתיאום המאבק בגזענות: ${sendToJusticeMinistry}`;
            console.log(`Updated justice_ministry_send: ${sendToJusticeMinistry}`);

            hubSpotContact.share_data_with_orgs = ngosToShareWith;
            hubSpotContact.ngo_contacts_to_user = ngosSendContactsToUser;
            await this.hubspot.updateUser(hubSpotContact);
            console.log(`updated ngos shares and contacts requests`);

          }
    this.content.addTo(`סיכום השיחה: <br />
                        ${summary}
                      `);
    summary = summary.replace(/(<br>|<\/br>|<br \/>)/mgi, '\n');
    hubSpotContact.status_summary = summary;
    await this.hubspot.updateUser(hubSpotContact);
    console.log(`updated summary on db: ${summary}`);
  break;



  default:
    console.log('could not find Offender Script');
    break;
    }
}}
