import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const ARTICLES = [
  {
    number: "Art. 1",
    title: "Würde des Menschen",
    category: "GRUNDRECHTE",
    body: "(1) Die Würde des Menschen ist unantastbar. Sie zu achten und zu schützen ist Verpflichtung aller staatlichen Gewalt.\n\n(2) Das Deutsche Volk bekennt sich darum zu unverletzlichen und unveräußerlichen Menschenrechten als Grundlage jeder menschlichen Gemeinschaft, des Friedens und der Gerechtigkeit in der Welt.\n\n(3) Die nachfolgenden Grundrechte binden Gesetzgebung, vollziehende Gewalt und Rechtsprechung als unmittelbar geltendes Recht.",
  },
  {
    number: "Art. 2",
    title: "Persönliche Freiheiten",
    category: "GRUNDRECHTE",
    body: "(1) Jeder hat das Recht auf die freie Entfaltung seiner Persönlichkeit, soweit er nicht die Rechte anderer verletzt und nicht gegen die verfassungsmäßige Ordnung oder das Sittengesetz verstößt.\n\n(2) Jeder hat das Recht auf Leben und körperliche Unversehrtheit. Die Freiheit der Person ist unverletzlich. Diese Rechte dürfen nur auf Grund eines Gesetzes eingeschränkt werden.",
  },
  {
    number: "Art. 3",
    title: "Gleichheit vor dem Gesetz",
    category: "GRUNDRECHTE",
    body: "(1) Alle Menschen sind vor dem Gesetz gleich.\n\n(2) Männer und Frauen sind gleichberechtigt. Der Staat fördert die tatsächliche Durchsetzung der Gleichberechtigung von Frauen und Männern und wirkt auf die Beseitigung bestehender Nachteile hin.\n\n(3) Niemand darf wegen seines Geschlechtes, seiner Abstammung, seiner Rasse, seiner Sprache, seiner Heimat und Herkunft, seines Glaubens, seiner religiösen oder politischen Anschauungen benachteiligt oder bevorzugt werden. Niemand darf wegen einer Behinderung benachteiligt werden.",
  },
  {
    number: "Art. 4",
    title: "Glaubens- und Gewissensfreiheit",
    category: "GRUNDRECHTE",
    body: "(1) Die Freiheit des Glaubens, des Gewissens und die Freiheit des religiösen und weltanschaulichen Bekenntnisses sind unverletzlich.\n\n(2) Die ungestörte Religionsausübung wird gewährleistet.\n\n(3) Niemand darf gegen sein Gewissen zum Kriegsdienst mit der Waffe gezwungen werden. Das Nähere regelt ein Bundesgesetz.",
  },
  {
    number: "Art. 5",
    title: "Meinungs- und Pressefreiheit",
    category: "GRUNDRECHTE",
    body: "(1) Jeder hat das Recht, seine Meinung in Wort, Schrift und Bild frei zu äußern und zu verbreiten und sich aus allgemein zugänglichen Quellen ungehindert zu unterrichten. Die Pressefreiheit und die Freiheit der Berichterstattung durch Rundfunk und Film werden gewährleistet. Eine Zensur findet nicht statt.\n\n(2) Diese Rechte finden ihre Schranken in den Vorschriften der allgemeinen Gesetze, den gesetzlichen Bestimmungen zum Schutze der Jugend und in dem Recht der persönlichen Ehre.\n\n(3) Kunst und Wissenschaft, Forschung und Lehre sind frei. Die Freiheit der Lehre entbindet nicht von der Treue zur Verfassung.",
  },
  {
    number: "Art. 6",
    title: "Ehe und Familie",
    category: "GRUNDRECHTE",
    body: "(1) Ehe und Familie stehen unter dem besonderen Schutze der staatlichen Ordnung.\n\n(2) Pflege und Erziehung der Kinder sind das natürliche Recht der Eltern und die zuförderst ihnen obliegende Pflicht. Über ihre Betätigung wacht die staatliche Gemeinschaft.\n\n(3) Gegen den Willen der Erziehungsberechtigten dürfen Kinder von der Familie nur auf Grundlage eines Gesetzes abgetrennt werden, wenn die Erziehungsberechtigten versagen oder wenn die Kinder aus anderen Gründen zu verwahrlosen drohen.\n\n(4) Jede Mutter hat Anspruch auf den Schutz und die Fürsorge der Gemeinschaft.",
  },
  {
    number: "Art. 8",
    title: "Versammlungsfreiheit",
    category: "GRUNDRECHTE",
    body: "(1) Alle Deutschen haben das Recht, sich ohne Anmeldung oder Erlaubnis friedlich und ohne Waffen zu versammeln.\n\n(2) Für Versammlungen unter freiem Himmel kann dieses Recht durch Gesetz oder auf Grund eines Gesetzes beschränkt werden.",
  },
  {
    number: "Art. 9",
    title: "Vereinigungs- und Koalitionsfreiheit",
    category: "GRUNDRECHTE",
    body: "(1) Alle Deutschen haben das Recht, Vereine und Gesellschaften zu bilden.\n\n(2) Vereinigungen, deren Zwecke oder deren Tätigkeit den Strafgesetzen zuwiderlaufen oder die sich gegen die verfassungsmäßige Ordnung oder gegen den Gedanken der Völkerverständigung richten, sind verboten.\n\n(3) Das Recht, zur Wahrung und Förderung der Arbeits- und Wirtschaftsbedingungen Vereinigungen zu bilden, ist für jedermann und für alle Berufe gewährleistet. Abreden, die dieses Recht einschränken oder zu behindern suchen, sind nichtig; Maßnahmen, die dies zum Ziele haben, sind rechtswidrig.\n\n(4) Für öffentliche Beamte gelten die Absätze 1 bis 3 mit Maßgaben eines Bundesgesetzes.",
  },
  {
    number: "Art. 10",
    title: "Brief-, Post- und Fernmeldegeheimnis",
    category: "GRUNDRECHTE",
    body: "(1) Das Briefgeheimnis sowie das Post- und Fernmeldegeheimnis sind unverletzlich.\n\n(2) Beschränkungen dürfen nur auf Grund eines Gesetzes angeordnet werden. Dieses Gesetz darf, wenn es um die Beschränkung des Post- oder Fernmeldegeheimnisses geht, nur mit Zustimmung des Bundesrates erlassen werden.",
  },
  {
    number: "Art. 14",
    title: "Eigentum und Erbrecht",
    category: "GRUNDRECHTE",
    body: "(1) Das Eigentum und das Erbrecht werden gewährleistet. Inhalt und Schranken werden durch die Gesetze bestimmt.\n\n(2) Eigentum verpflichtet. Sein Gebrauch soll zugleich dem Wohle der Allgemeinheit dienen.\n\n(3) Eine Enteignung ist nur zum Wohle der Allgemeinheit zulässig. Sie ist nur durch Gesetz oder auf Grund eines Gesetzes zulässig, das Art und Ausmaß der Entschädigung regelt. Die Entschädigung ist unter gerechter Abwägung der Interessen der Allgemeinheit und der Beteiligten zu bestimmen. Im Falle einer Enteignung steht dem Betroffenen der Rechtsweg vor den ordentlichen Gerichten offen.",
  },
  {
    number: "Art. 16a",
    title: "Asylrecht",
    category: "GRUNDRECHTE",
    body: "(1) Politisch Verfolgte genießen Asylrecht.\n\n(2) Auf Absatz 1 kann sich nicht berufen, wer aus einem Mitgliedstaat der Europäischen Union einreist. Die Staaten außerhalb der Europäischen Union, auf die diese Voraussetzung zutrifft, werden durch Gesetz bestimmt, das der Zustimmung des Bundesrates bedarf. Im Übrigen können Staaten, in denen die Anwendung des Abkommens über die Rechtsstellung der Flüchtlinge und der Konvention zum Schutze der Menschenrechte und Grundfreiheiten sichergestellt ist, durch Gesetz bestimmt werden, bei denen die Voraussetzung des Absatzes 1 als erfüllt gilt.",
  },
  {
    number: "Art. 20",
    title: "Staatsprinzipien, Widerstandsrecht",
    category: "STAATSPRINZIPIEN",
    body: "(1) Die Bundesrepublik Deutschland ist ein demokratischer und sozialer Bundesstaat.\n\n(2) Alle Staatsgewalt geht vom Volke aus. Sie wird vom Volke in Wahlen und Abstimmungen und durch besondere Organe der Gesetzgebung, der vollziehenden Gewalt und der Rechtsprechung ausgeübt.\n\n(3) Die Gesetzgebung ist an die verfassungsmäßige Ordnung, die Exekutive und die Judikative sind an Gesetz und Recht gebunden.\n\n(4) Gegen jeden, der es unternimmt, diese Ordnung zu beseitigen, haben alle Deutschen das Recht zum Widerstand, wenn andere Abhilfe nicht möglich ist.",
  },
  {
    number: "Art. 38",
    title: "Wahl des Bundestages",
    category: "BUNDESTAG",
    body: "(1) Die Abgeordneten des Deutschen Bundestages werden in allgemeiner, unmittelbarer, freier, gleicher und geheimer Wahl gewählt. Sie sind Vertreter des ganzen Volkes, an Aufträge und Weisungen nicht gebunden und nur ihrem Gewissen unterworfen.\n\n(2) Wahlberechtigt ist, wer das achtzehnte Lebensjahr vollendet hat. Wählbar ist, wer das Alter besitzt, mit dem die Wählbarkeit zum Bundestag beginnt, und die Staatsangehörigkeit eines Mitgliedstaates der Europäischen Union besitzt.\n\n(3) Das Nähere bestimmt ein Bundeswahlgesetz.",
  },
  {
    number: "Art. 54",
    title: "Wahl des Bundespräsidenten",
    category: "BUNDESREGIERUNG",
    body: "(1) Der Bundespräsident wird ohne Aussprache von der Bundesversammlung gewählt.\n\n(2) Wählbar ist jeder Deutsche, der das Wahlrecht zum Bundestage besitzt und das vierzigste Lebensjahr vollendet hat.\n\n(3) Das Amt des Bundespräsidenten dauert fünf Jahre. Wiederwahlbarkeit ist zulässig.\n\n(4) Die Bundesversammlung besteht aus den Mitgliedern des Bundestages und einer gleichen Anzahl von Mitgliedern, die von den Volksvertretungen der Länder nach den Grundsätzen der Verhältniswahl gewählt werden.",
  },
  {
    number: "Art. 63",
    title: "Wahl des Bundeskanzlers",
    category: "BUNDESREGIERUNG",
    body: "(1) Der Bundeskanzler wird auf Vorschlag des Bundespräsidenten vom Bundestage ohne Aussprache gewählt.\n\n(2) Gewählt ist, wer die Stimmen der Mehrheit der Mitglieder des Bundestages auf sich vereinigt. Der Gewählte ist vom Bundespräsidenten zu ernennen.\n\n(3) Schlägt der Bundestag den Vorschlag des Bundespräsidenten ab, so kann der Bundestag mit der Mehrheit seiner Mitglieder einen Bundeskanzler wählen.\n\n(4) Hat der Bundestag weder nach Absatz 2 noch nach Absatz 3 gewählt, so findet sofort eine neue Abstimmung statt, bei der derjenige gewählt ist, der die meisten Stimmen erhält.",
  },
  {
    number: "Art. 79",
    title: "Änderung des Grundgesetzes",
    category: "VERFASSUNGSÄNDERUNG",
    body: "(1) Das Grundgesetz kann nur durch ein Gesetz geändert werden, das den Wortlaut des Grundgesetzes ausdrücklich ändert oder ergänzt.\n\n(2) Ein solches Gesetz bedarf der Zustimmung von zwei Dritteln der Mitglieder des Bundestages und zwei Dritteln der Stimmen des Bundesrates.\n\n(3) Eine Änderung dieses Grundgesetzes, durch welche die in den Artikeln 1 und 20 niedergelegten Grundsätze berührt werden, ist unzulässig. Eine Änderung der Vorschriften über die Mitwirkung der Länder bei der Gesetzgebung ist unzulässig.",
  },
  {
    number: "Art. 97",
    title: "Unabhängigkeit der Richter",
    category: "RECHTSPRECHUNG",
    body: "(1) Die Richter sind unabhängig und nur dem Gesetze unterworfen.\n\n(2) Die hauptamtlich angestellten Richter können wider ihren Willen nur kraft richterlicher Entscheidung und nur aus Gründen und unter den Verfahren entlassen oder in den Ruhestand versetzt werden, die das Gesetz bestimmt.",
  },
  {
    number: "Art. 146",
    title: "Geltungsdauer des GG",
    category: "SCHLUSSBESTIMMUNGEN",
    body: "Dieses Grundgesetz, das nach Vollendung der Einheit und Freiheit Deutschlands für das gesamte deutsche Volk gilt, verliert seine Gültigkeit an dem Tage, an dem eine Verfassung in Kraft tritt, die von dem deutschen Volke in freier Entscheidung beschlossen worden ist.",
  },
];

async function seedArticles() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log("Seeding articles...");

    for (const article of ARTICLES) {
      await connection.execute(
        "INSERT INTO articles (number, title, category, body) VALUES (?, ?, ?, ?)",
        [article.number, article.title, article.category, article.body]
      );
    }

    console.log(`✓ Successfully seeded ${ARTICLES.length} articles`);
  } catch (error) {
    console.error("Error seeding articles:", error);
  } finally {
    await connection.end();
  }
}

seedArticles();
