import { Component, OnInit } from '@angular/core';
import { ContentService } from 'hatool';
import { HubspotService } from './hubspot.service';


function openCallTime() {
        const m_names = ['ינואר', 'פברואר', 'מרץ',
                        'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר',
                        'אוקטובר', 'נובמבר', 'דצמבר'];

        const d_names = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

        const myDate = new Date();
        myDate.setDate(myDate.getDate() + 7);
        const curr_date = myDate.toISOString().slice(0, 10);
        const curr_month = myDate.getMonth();
        const curr_day  = myDate.getDay();
        const curr_time = (myDate.getHours(), myDate.getMinutes());
        return ({currentDate: curr_date, dayName: d_names[curr_day], currentTime: curr_time });
    }

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
    this.doIt();
  }

  async doIt() {

    //   service person side
    const vid = window.location.search.slice(1).split('&')[0].split('=')[1];
    const userInfo: any = await this.hubspot.getUser(vid);
    console.log(userInfo);
    const name = userInfo.full_name;

    this.content.addTo('[מעבר למוקדנ/ית - המידע מכאן והלאה יוצג במערכת ההנחיה למוקד/נית שיתקשר אותו מול הפונה במדיום שבחרו]');

  //   this.content.addTo(`חזרו אל הפונה באמצעי הקשר שבחרו:
  //                       "שלום ${name}, אני חוזר/ת אליך בהמשך לפניה שלך מ-${startTime.currentDate}, בנוגע ל${requiredService} על ארוע של
  //                        ${complaintType}, שבוצעה על ידי ${offenders[offenderIndex].displayValue}.
  //                       על מנת שאוכל לסייע לך יש לי עוד מספר שאלות."`);

  //   this.content.setTextArea();
  //   this.content.addTo(`השלימו את הפרטים הבאים בבירור עם הפונה: <br />
  //                   "
  //                       1. האם נעצרת? <br />
  //                       2. האם הוגש נגדך כתב אישום? <br />
  //                       3. האם מישהו מייצג אותך?  <br />
  //                       4. איפה בדיוק אירע האירוע, מתי בדיוק? <br />
  //                       5. האם יש תיאור של השוטר או שם? <br />
  //                       6. האם תיעדת את המקרה <br />
  //                       7. האם היו עדים שיכולם להעיד על המקרה? <br />
  //                       8. האם יש לך מספר ניידת, וכו'?<br />
  //                   "`);

  // const moreDetails = Array();
  // moreDetails.push(await this.content.waitForInput());

  // this.content.addTo(`בדקו והתייעצו:
  //                           1. האם המידע הקיים מאפשר ${requiredService} בעקבות הארוע? <br />
  //                           2. מיהו הגורם אליו יש להעביר תלונה או פניה בנושא? <br />
  //                           3. האם ישנם ארגוני חברה אזרחית שיוכלו לסייע לפונה בנושא הפניה? <br />
  //                         `);


  // this.content.addOptions(                                   // check if details enable complaint
  //                     `האם המידע הקיים מאפשר ${requiredService} בעקבות הארוע?`,
  //                     [{ value: true, display: 'כן'},
  //                      { value: false, display: 'לא' },
  //                     ]);

  // const canComplain = await this.content.waitForInput();
  // this.content.addFrom(canComplain  ? 'כן' : 'לא');

  // if (canComplain) {                                                    // if can complain thread
  //   const relevantRecipientsOptions = offenders[offenderIndex].relevant_recipients;

  //   this.content.addOptions('מהבירור שערכתם, לאיזה גוף תוגש התלונה?',
  //                           relevantRecipientsOptions);

  //   const complaintRecipient = await this.content.waitForInput();
  //                                                       // check if help is needed writing a complaint

  //   this.content.addFrom(complaintRecipient);
  //   this.content.addOptions(`עדכנו את הפונה: <br />
  //                           "
  //                             מהמידע שמסרת לנו עולה כי באפשרותכם להגיש תלונה ל${complaintRecipient}.<br />
  //                             האם תרצה/תרצו שנסייע לך לנסח את התלונה ולשלוח אותה?<br />
  //                           "

  //                           האם הפונה מעוניינ/ת להעביר את הפרטים לארגונים אלו?`,
  //                           [
  //                             {value: true, display: 'כן'},
  //                             {value: false, display: 'לא'},
  //                           ]);

  //   const writeComplaint = await this.content.waitForInput();
  //   this.content.addFrom(writeComplaint ? 'כן' : 'לא');

  //   if (writeComplaint) {                           // if user wants help delivering complaint
  //     this.content.addTo(`ענו לפונה: <br />
  //                         "בסדר גמור. אני אחזור אליך עם הצעה לנוסח הפניה ועם הסבר איך שולחים את התלונה"
  //                         `);
  //                       }
  //   }                                               // end if user wants help delivering complaint


  //                                               // check if user want to share detais with other NGOs
  // this.content.addOptions(`
  //   עדכנו את הפונה: <br />
  //    "ישנם מספר גורמי חברה אזרחית שיוכלו אולי לסייע לך בנוגע לפנייה שלך. אלו הארגונים: <br />
  //     א. [ארגון א']  <br />
  //     ב. [ארגון ב']  <br />
  //     ג. [ארגון ג'].  <br />
  //     האם תרצה שנעביר להם את פרטי המקרה ופרטי ההתקשרות איתך?"

  //     מה השיב/ה הפונה?
  //   `,
  //   [
  //     {value: true, display: 'כן'},
  //     {value: false, display: 'לא'},
  //   ]);

  //   const ngoContacts = await this.content.waitForInput();
  //   this.content.addFrom(ngoContacts ? 'כן' : 'לא');
  // this.content.addTo(`סכמו את השיחה והנקודות העקריות מול הפונה: <br />
  //                     " [פה יופיע סיכום דינמי של השיחה] <br />
  //                     האם יש לך שאלות אם פרטים נוספים שתרצו להוסיף או לברר? <br />
  //                     "
  //                     הזינו את השאלות והמידע הנוסף: <br />
  //                     `);

  // this.content.setTextArea();

  // const newDetails = await this.content.waitForInput();
  // moreDetails.push(newDetails);

  // const contactDetailsStrinify = contacts.map(contact => contact.method + ':' + contact.details + '<br />');

  // this.content.addTo(`הודו לפונה ועדכנו אותו/אותה לגבי ההמשך:<br/>
  //                     "תודה לך שפנית אלינו. אני או מישהו מהצוות שלי יהיו איתך בקשר
  //                      בתוך שבוע. את/ה מוזמנ/ת ליצור איתנו קשר בכל שאלה או מידע נוסף שיהיו לך"ניצור איתך קשר באחד האמצעים הבאים:
  //                     ${contactDetailsStrinify}
  //                     `);

  this.content.addTo(`משימות להמשך הטיפול: <br />
                      העבירו את פרטי הארוע לגורם הרלוונטי בארגון שלכם. <br />
                      העבירו את פרטי הארוע לארגונים אליהם ביקש/ה הפונה לפנות. <br />
                      הוסיפו תזכורת למעקב אחר הטיפול במקרה`);
}}
