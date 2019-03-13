import { Component, OnInit } from '@angular/core';
import { ContentService } from 'hatool';
import { HubspotService } from './hubspot.service';

const offenderScenarios =
[
      {value: 0,
      display: 'משטרה',
      displayValue: 'משטרה',
      relevantRecipients: [ {
                             value: 'מח"ש',
                             display: 'מחלקת חקירות שוטרים (מח"ש)',
                             complaintTypes: ['התנהגות או התבטאות גזענית מצד שוטר/ת']
                             },

                             {value: 'מחלקת פניות ציבור',
                              display: 'מחלקת פניות ציבור במשטרה',
                              complaintTypes: ['התנהגות או התבטאות גזענית מצד שוטר/ת']
                             },
                  ],
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
         value: 'אין',
         display: 'לא'
         },
        ]
      }
    ]
},

      {value: 1,
       display: 'מאבטח/ת',
       displayValue: 'מאבט/ת',
       relevantRecipients: null,
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


const shareWithOrganizatoins = [
  {
    code: 0,
    name:'הועד נגד עינויים',
    description:'הוועד פועל למען בני אדם באשר הם - ישראלים, פלסטינים, מהגרי עבודה ואזרחים זרים נוספים, השוהים בישראל ובשטחים הכבושים, במטרה להגן עליהם מפני עינויים והתעללויות שנוקטות רשויות האכיפה והחקירה הישראליות, כלומר: משטרת ישראל, שירות הביטחון הכללי, שירות בתי הסוהר וצה"ל.',
    moreinfo:[{website:'http://stoptorture.org.il/'}],
    contacts: [
      {email:'',phone:'',website:'http://stoptorture.org.il/'}
    ]
  }

]

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
    const name = userInfo.full_name;
    const complaintType = userInfo.complaint_type;
    let eventDescription = userInfo.event_description;        // we will update the event Description during the process
    const requiredService = userInfo.required_service;
    const offender = userInfo.offender;
    const offenderIndex = userInfo.offender_code;

    const startDate = new Date(parseInt(userInfo.createdate, 10)).toISOString().slice(0, 10);
    const modifiedDate = new Date(parseInt(userInfo.lastmodifieddate, 10)).toISOString().slice(0, 10);

    let contact = {'email':'', 'phone':'', 'whatsapp':'', 'facebook':''};  // wrap contact details
    Object.keys(contact).forEach((key) => {
                                            if (key in userInfo) {
                                              contact[key] = userInfo[key];
                                            }
                                          }
                                  );
    const files = {}
    for (let fileIndex=0; fileIndex<=5; fileIndex++) {                    // wrap uploaded file info, up to 5 files
      const filePointer = `file${fileIndex}`
      const fileDescripionString = `file${fileIndex}description`;
      if (filePointer in userInfo && fileDescripionString in userInfo) {
        files[fileIndex] = {'description': userInfo[fileDescripionString], 'path':userInfo[filePointer]}
      }
    }

    this.content.addTo('[מעבר למוקדנ/ית - המידע מכאן והלאה יוצג במערכת ההנחיה למוקד/נית שיתקשר אותו מול הפונה במדיום שבחרו]');

    this.content.addTo(`חזרו אל הפונה באמצעי הקשר שבחרו:
                        "שלום ${name}, אני חוזר/ת אליך בהמשך לפניה שלך מ-${startDate}, בנוגע ל${requiredService} על ארוע של
                         ${complaintType}, שבוצעה על ידי ${offender}.
                        על מנת שאוכל לסייע לך יש לי עוד מספר שאלות."`);

    const offenderScenario = offenderScenarios[offenderIndex]          // pull the relevant scenario

    switch (offenderIndex) {
      case '0':

        if ('moreQuestions' in offenderScenario) {
          let moreQuestions = offenderScenario['moreQuestions'];
          const answers = Array();

          this.content.addTo(`השלימו את הפרטים הבאים בבירור עם הפונה:`);

          for (let questionIndex = 1; questionIndex <= moreQuestions.length; questionIndex++) {             // add more details to event_description
            let questionObject = moreQuestions[questionIndex-1];
            let question = `${questionIndex}. ${questionObject.question}`;
            let questionKey = questionObject.questionKey;

            if ('answers' in questionObject && questionObject.answers != null) {
              this.content.addOptions(question, questionObject.answers);
            } else {
              this.content.addTo(question);
              this.content.setTextArea();
            }
            const newAnswer = await this.content.waitForInput();
            answers.push({'key': questionKey, 'detail': newAnswer});

          }

          let moreDetails = answers.map(e => (e.key + ': ' + e.detail)).join(', ');
          eventDescription += `\nפרטים נוספים:\n ${moreDetails}`;
          hubSpotContact.event_description = eventDescription;

          await this.hubspot.updateUser(hubSpotContact);
          console.log(`updated event details: ${userInfo.event_description}`)

        }

        console.log(`updated event details: ${userInfo.event_description}`)

        if ('askForOffenderDetails' in offenderScenario) {                            // check if we should ask optional offender details quetsion
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

        hubSpotContact.offender_person_details = answers;
        await this.hubspot.updateUser(hubSpotContact);
        console.log(`update offender_person_details: ${hubSpotContact.offender_person_details}`);

      }

        this.content.addOptions(                                   // check if details enable complaint
                      `האם המידע הקיים מאפשר ${requiredService} בעקבות הארוע?`,
                      [{ value: true, display: 'כן'},
                       { value: false, display: 'לא' },
                      ]);

        const canBeServed = await this.content.waitForInput();
        if (requiredService == 'הגשת תלונה') {
          const wantsTocomplain = true;
        } else {
          const wantsTocomplain = false;
        }

        hubSpotContact.can_service = canBeServed;
        await this.hubspot.updateUser(hubSpotContact);

        this.content.addFrom(canBeServed  ? 'כן' : 'לא');

        console.log(`updated can_service value: ${hubSpotContact.can_service}`)


        if (canBeServed) {                                                    // if can complain thread and user wants to complain

          const relevantRecipients = offenderScenario.relevantRecipients
          const relevantRecipientsOptions = relevantRecipients.filter((org) => org.complaintTypes.indexOf(complaintType) > -1 );  // filter complaint recipients by offender + complaintType

          if (relevantRecipientsOptions.length == 0) {
              this.content.addTo('לא נמצא במערכת מידע לגבי הגופים להם ניתן לדווח על המקרה. עדכנו את הפונה שתבררו מה האפשרויות ותעדכנו אותו/אותה בהמשך');
          } else {
              const approvedReciepents = [];
              this.content.addTo(`ניתן לשלוח את התלונה ל-${relevantRecipientsOptions.length} גורמים. <br> אני אגיד לך מהם, כדי שתוכל/י להגיד לי למי מהם תרצה/תרצי לפנות:`);

              for (let relevantRecipientsIndex = 0; relevantRecipientsIndex <= relevantRecipientsOptions.length - 1; relevantRecipientsIndex++) {
                let recipient = relevantRecipientsOptions[relevantRecipientsIndex];
                this.content.addOptions(`ניתן לפנות בנוגע למקרה הזה אל ${recipient.display}. <br>\
                                          האם תרצו שנסייע לכם ב${requiredService} אליהם?`,
                                        [
                                         { display:'כן', value:true},
                                         { display:'לא', value:false}
                                       ]);
                const sendToRecipient = await this.content.waitForInput();
                if (sendToRecipient) {
                  approvedReciepents.push(recipient);
                }
              }

              const sendReportTo = approvedReciepents.map((org)=>org.display).join(', ');                       // unify list of compaint recievers
              hubSpotContact.send_complaint_to = sendReportTo;

              await this.hubspot.updateUser(hubSpotContact);
              console.log(`updated send_complaint_to: ${hubSpotContact.send_complaint_to}`)


              if (sendReportTo.length > 0 ) {                           // if user wants help delivering complaint
                this.content.addTo(`ענו לפונה: <br />
                              "בסדר גמור. אני אחזור אליך עם הצעה לנוסח הפניה ועם הסבר איך שולחים את התלונה"
                              `);
                            }

            }                                            // check if help is needed writing a complain

                                                // check if user want to share detais with other NGOs
      this.content.addOptions(`
        עדכנו את הפונה: <br />
        "ישנם מספר גורמי חברה אזרחית שיוכלו אולי לסייע לך בנוגע לפנייה שלך. אלו הארגונים: <br />
        א. [ארגון א']  <br />
        ב. [ארגון ב']  <br />
        ג. [ארגון ג'].  <br />
        האם תרצה שנעביר להם את פרטי המקרה ופרטי ההתקשרות איתך?"

        מה השיב/ה הפונה?
        `,
        [
          {value: true, display: 'כן'},
          {value: false, display: 'לא'},
        ]);
      }


      this.content.addTo(`משימות להמשך הטיפול: <br />
                      העבירו את פרטי הארוע לגורם הרלוונטי בארגון שלכם. <br />
                      העבירו את פרטי הארוע לארגונים אליהם ביקש/ה הפונה לפנות. <br />
                      הוסיפו תזכורת למעקב אחר הטיפול במקרה`);
    break;

  default:
    console.log('could not find Offender Script');
    break
    }
}}
