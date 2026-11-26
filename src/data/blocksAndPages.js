export const BLOCK_CATEGORIES = [
  "Osnovno",
  "Struktura",
  "Sekcije",
  "Konverzija i forme",
  "Napredno"
];

export const BLOCK_DEFINITIONS = [
  {
    {
    type: "aboutEditorial",
    label: "O meni (Editorial)",
    category: "Sekcije",
    description: "Editorial O meni sekcija sa celom pozadinom, slikom desno i lavanda akcentima",
    defaultProps: {
      eyebrow: "ĆAO, JA SAM MARIJANA",
      titleMain: "Pomažem ti da izađeš iz rutine i izgradiš biznis koji je",
      titleAccent: "zaista tvoj",
      subtitle:
        "Godinama sam radila po tuđim pravilima dok nisam počela da gradim svoje digitalne proizvode i sisteme. Danas ti pokazujem kako da napraviš jednostavan, održiv online posao po svojoj meri.",
      buttonText: "Pročitaj moju priču",
      buttonHref: "#kontakt",
      imageUrl: "",
      imageAlt: "Marijana portret",
    },
    defaultStyle: {
      backgroundColor: "#787577",
      textColor: "#ffffff",
      accentColor: "#e6d8f2",
      buttonBg: "#e6d8f2",
      buttonTextColor: "#231f20",
      paddingTop: 96,
      paddingBottom: 96,
    },
  },
    type: "hero",
    label: "Hero sekcija",
    category: "Sekcije",
    description: "Glavni naslov, opis, dugmad i istaknuta slika",
    defaultProps: {
      eyebrow: "DIGITALNI ALATI · JEDNOSTAVNI SISTEMI",
      title: "Tvoja ideja, tvoj glas, tvoj sistem",
      description:
        "Mesto za digitalne proizvode, pametne alate i sisteme koji ti pomažu da organizuješ ideje i razvijaš online posao",
      primaryButtonText: "Istraži biblioteku",
      primaryButtonUrl: "#biblioteka",
      secondaryButtonText: "Blog",
      secondaryButtonUrl: "#blog",
      imageUrl: "",
      imageAlt: "Hero fotografija"
    },
    defaultStyle: {
      backgroundColor: "#fbf8f2",
      textColor: "#2b2530",
      accentColor: "#8EA386",
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: 44,
      paddingTop: 72,
      paddingBottom: 72,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: "#e5ddd1",
      width: "100%",
      minHeight: 420,
      textAlign: "left"
    }
  },
  {
    type: "header",
    label: "Header / Navigacija",
    category: "Struktura",
    description: "Naziv brenda i navigacioni linkovi stranice.",
    defaultProps: {
      brand: "Marijana Digital Soul",
      links: ["Počni ovde", "AI alati", "Biblioteka rešenja", "Blog", "Kontakt"]
    },
    defaultStyle: {
      backgroundColor: "#fbf8f2",
      textColor: "#2c2631",
      accentColor: "#8060a5",
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: 22,
      paddingTop: 18,
      paddingBottom: 18,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: "#e8e0d5",
      width: "100%",
      minHeight: 72,
      textAlign: "left"
    }
  },
  {
    type: "footer",
    label: "Footer / Podnožje",
    category: "Struktura",
    description: "Podnožje sajta sa brendom, kontaktom i napomenom.",
    defaultProps: {
      brand: "Marijana Digital Soul",
      text: "Digitalni alati, sistemi i sadržaji za organizovan rad i rast.",
      copyright: "© 2026 Marijana Digital Soul. Sva prava zadržana."
    },
    defaultStyle: {
      backgroundColor: "#211b2b",
      textColor: "#f8f4ee",
      accentColor: "#bba3d8",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: 13,
      paddingTop: 44,
      paddingBottom: 44,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: "#342b40",
      width: "100%",
      minHeight: 160,
      textAlign: "center"
    }
  },
  {
    type: "text",
    label: "Tekstualni blok",
    category: "Osnovno",
    description: "Naslov i pasus za članke, opise ili objašnjenja.",
    defaultProps: {
      heading: "Naslov sekcije ili objašnjenja",
      body: "Ovde unesi detaljan tekst, uputstvo ili objašnjenje koje želiš da prikažeš posetiocima."
    },
    defaultStyle: {
      backgroundColor: "#ffffff",
      textColor: "#30243b",
      accentColor: "#8060a5",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: 15,
      paddingTop: 32,
      paddingBottom: 32,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e8e0d5",
      width: "100%",
      minHeight: 120,
      textAlign: "left"
    }
  },
  {
    type: "image",
    label: "Slika / Mockup",
    category: "Osnovno",
    description: "Jedna slika ili mockup sa opisom i linkom.",
    defaultProps: {
      imageUrl: "",
      alt: "Slika blok",
      caption: "Dodaj sliku iz Media biblioteke ili unesi URL slike.",
      linkUrl: ""
    },
    defaultStyle: {
      backgroundColor: "#f8f3eb",
      textColor: "#30243b",
      accentColor: "#8f9f83",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: 13,
      paddingTop: 24,
      paddingBottom: 24,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#e6ded2",
      width: "100%",
      minHeight: 240,
      textAlign: "center"
    }
  },
  {
    type: "gallery",
    label: "Galerija slika",
    category: "Osnovno",
    description: "Više kartica/slika u mreži za vizuale i mockupe.",
    defaultProps: {
      title: "Galerija vizuala",
      items: [
        { id: "g1", title: "Vizual 01", subtitle: "Opis prvog vizuala", imageUrl: "" },
        { id: "g2", title: "Vizual 02", subtitle: "Opis drugog vizuala", imageUrl: "" },
        { id: "g3", title: "Vizual 03", subtitle: "Opis trećeg vizuala", imageUrl: "" }
      ]
    },
    defaultStyle: {
      backgroundColor: "#fbf8f2",
      textColor: "#30243b",
      accentColor: "#8f9f83",
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: 24,
      paddingTop: 36,
      paddingBottom: 36,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 14,
      borderWidth: 0,
      borderColor: "#e6ded2",
      width: "100%",
      minHeight: 240,
      textAlign: "left"
    }
  },
  {
    type: "button",
    label: "Dugme",
    category: "Osnovno",
    description: "Samostalno dugme sa tekstom i linkom.",
    defaultProps: {
      label: "Saznaj više",
      url: "#kontakt",
      variant: "primary"
    },
    defaultStyle: {
      backgroundColor: "transparent",
      textColor: "#ffffff",
      accentColor: "#8EA386",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: 13,
      paddingTop: 20,
      paddingBottom: 20,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 999,
      borderWidth: 0,
      borderColor: "#8EA386",
      width: "100%",
      minHeight: 72,
      textAlign: "center"
    }
  },
  {
    type: "cta",
    label: "CTA baner",
    category: "Konverzija i forme",
    description: "Poziv na akciju sa istaknutim dugmetom.",
    defaultProps: {
      kicker: "SLEDEĆI KORAK",
      title: "Spreman/na si da organizuješ svoj sistem?",
      description: "Izaberi program, šablon ili zakaži individualnu saradnju.",
      buttonText: "Započni sada",
      buttonUrl: "#saradnja"
    },
    defaultStyle: {
      backgroundColor: "#2d1b4e",
      textColor: "#ffffff",
      accentColor: "#c28bdc",
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: 32,
      paddingTop: 48,
      paddingBottom: 48,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 18,
      borderWidth: 0,
      borderColor: "#2d1b4e",
      width: "100%",
      minHeight: 200,
      textAlign: "center"
    }
  },
  {
    type: "features",
    label: "Kartice / Karakteristike",
    category: "Sekcije",
    description: "Grid kartica (npr. programi, sistemi, prednosti).",
    defaultProps: {
      kicker: "BIBLIOTEKA REŠENJA",
      title: "Šta sve dobijaš",
      cards: [
        { id: "c1", number: "01", title: "Ženski programi", description: "Alati i vodiči za lični razvoj i ravnotežu.", buttonText: "Otvori", targetPageId: "page-women" },
        { id: "c2", number: "02", title: "Gotovi šabloni", description: "Planeri i radni listovi spremni za upotrebu.", buttonText: "Otvori", targetPageId: "page-templates" },
        { id: "c3", number: "03", title: "Marketing programi", description: "Sistemi i strategije za organizovanu prodaju.", buttonText: "Otvori", targetPageId: "page-marketing" }
      ]
    },
    defaultStyle: {
      backgroundColor: "#f8f3eb",
      textColor: "#30243b",
      accentColor: "#8f9f83",
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: 28,
      paddingTop: 44,
      paddingBottom: 44,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#e9dfd2",
      width: "100%",
      minHeight: 260,
      textAlign: "left"
    }
  },
  {
    type: "testimonials",
    label: "Utisci / Testimonials",
    category: "Sekcije",
    description: "Citati i iskustva korisnika i klijenata.",
    defaultProps: {
      title: "Utisci polaznika i saradnika",
      items: [
        { id: "t1", quote: "Sve ideje su konačno na jednom mestu i imam jasan plan rada.", author: "Jelena M." },
        { id: "t2", quote: "Jednostavni sistemi bez suvišnog komplikovanja.", author: "Milica K." }
      ]
    },
    defaultStyle: {
      backgroundColor: "#fbf8f2",
      textColor: "#30243b",
      accentColor: "#9b774b",
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: 26,
      paddingTop: 40,
      paddingBottom: 40,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#e6ded2",
      width: "100%",
      minHeight: 200,
      textAlign: "left"
    }
  },
  {
    type: "pricing",
    label: "Paketi / Cenovnik",
    category: "Konverzija i forme",
    description: "Pregled paketa, programa ili pretplata.",
    defaultProps: {
      title: "Programi i paketi",
      plans: [
        { id: "p1", name: "Starter šabloni", price: "29 €", note: "Za brz početak i organizaciju", cta: "Izaberi" },
        { id: "p2", name: "Digital Soul sistem", price: "79 €", note: "Kompletan radni prostor i vodiči", cta: "Izaberi" }
      ]
    },
    defaultStyle: {
      backgroundColor: "#f8f4ed",
      textColor: "#30243b",
      accentColor: "#8060a5",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: 15,
      paddingTop: 40,
      paddingBottom: 40,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#e0d7c9",
      width: "100%",
      minHeight: 220,
      textAlign: "center"
    }
  },
  {
    type: "faq",
    label: "Česta pitanja (FAQ)",
    category: "Sekcije",
    description: "Pitanja i odgovori za brze informacije.",
    defaultProps: {
      title: "Česta pitanja",
      questions: [
        { id: "f1", q: "Kako se koriste šabloni i materijali?", a: "Odmah nakon otvaranja možeš prilagoditi tekst, slike i strukturu svojim potrebama." },
        { id: "f2", q: "Da li mogu dodavati nove stranice i blokove?", a: "Da, u levom panelu možeš dodavati nove stranice i blokove bez ograničenja." }
      ]
    },
    defaultStyle: {
      backgroundColor: "#ffffff",
      textColor: "#30243b",
      accentColor: "#78866b",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: 14,
      paddingTop: 36,
      paddingBottom: 36,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#e6ded2",
      width: "100%",
      minHeight: 200,
      textAlign: "left"
    }
  },
  {
    type: "contact",
    label: "Kontakt blok",
    category: "Konverzija i forme",
    description: "Kontakt podaci, email, lokacija i radno vreme.",
    defaultProps: {
      title: "Kontakt i saradnja",
      email: "kontakt@digitalsoul.rs",
      phone: "+381 60 000 0000",
      note: "Odgovaram na upite radnim danima u najkraćem roku."
    },
    defaultStyle: {
      backgroundColor: "#f8f3eb",
      textColor: "#30243b",
      accentColor: "#78866b",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: 14,
      paddingTop: 32,
      paddingBottom: 32,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#e3d8c9",
      width: "100%",
      minHeight: 160,
      textAlign: "left"
    }
  },
  {
    type: "form",
    label: "Forma / Upitnik",
    category: "Konverzija i forme",
    description: "Interaktivna kontakt ili prijava forma.",
    defaultProps: {
      title: "Pošalji upit",
      submitLabel: "Pošalji poruku",
      successMessage: "Poruka je zabeležena u lokalnom pregledu."
    },
    defaultStyle: {
      backgroundColor: "#fffdf8",
      textColor: "#30243b",
      accentColor: "#78866b",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: 14,
      paddingTop: 32,
      paddingBottom: 32,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#e2d7c7",
      width: "100%",
      minHeight: 220,
      textAlign: "left"
    }
  },
  {
    type: "video",
    label: "Video blok",
    category: "Napredno",
    description: "Ugrađeni video ili poster kartica sa linkom.",
    defaultProps: {
      title: "Video prezentacija",
      videoUrl: "",
      posterUrl: "",
      caption: "Dodaj link ka videu (MP4 / YouTube / Vimeo) ili poster sliku."
    },
    defaultStyle: {
      backgroundColor: "#211b2b",
      textColor: "#ffffff",
      accentColor: "#bba3d8",
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: 24,
      paddingTop: 36,
      paddingBottom: 36,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 16,
      borderWidth: 0,
      borderColor: "#211b2b",
      width: "100%",
      minHeight: 240,
      textAlign: "center"
    }
  },
  {
    type: "custom_html",
    label: "Custom HTML",
    category: "Napredno",
    description: "Prilagođeni HTML/CSS fragment za napredne korisnike.",
    defaultProps: {
      title: "Prilagođeni HTML kod",
      html: '<div style="padding:16px;border-radius:10px;background:#f3ecdf;color:#30243b;"><strong>Prilagođeni HTML blok</strong> — izmeni u Properties panelu.</div>'
    },
    defaultStyle: {
      backgroundColor: "#ffffff",
      textColor: "#30243b",
      accentColor: "#8060a5",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: 14,
      paddingTop: 24,
      paddingBottom: 24,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e0d7c9",
      width: "100%",
      minHeight: 120,
      textAlign: "left"
    }
  }
];

let uidCounter = 1;
export const nextId = (prefix = "blk") => {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${uidCounter}`;
};

export function createBlock(type, overrides = {}) {
  const def = BLOCK_DEFINITIONS.find((b) => b.type === type) || BLOCK_DEFINITIONS[3];
  return {
    id: nextId("block"),
    type: def.type,
    label: def.label,
    props: {
      ...structuredClone(def.defaultProps),
      ...(overrides.props || {})
    },
    style: {
      ...def.defaultStyle,
      ...(overrides.style || {})
    }
  };
}

export function createInitialProject() {
  return {
    name: "Digital Soul Sajt",
    activePageId: "page-home",
    media: [],
    pages: [
      {
        id: "page-home",
        title: "Početna stranica",
        slug: "/",
        blocks: [
          createBlock("header"),
          createBlock("hero"),
          createBlock("features", {
            props: {
              kicker: "BIBLIOTEKA REŠENJA",
              title: "Digitalni proizvodi i programi",
              cards: [
                {
                  id: "lib-1",
                  number: "01",
                  title: "Ženski programi",
                  description: "Alati, vodiči i sadržaji za svakodnevni život, lični razvoj i ravnotežu.",
                  buttonText: "Istraži programe",
                  targetPageId: "page-women"
                },
                {
                  id: "lib-2",
                  number: "02",
                  title: "Tinejdžerski i dečji programi",
                  description: "Materijali i programi prilagođeni mladima i njihovim potrebama.",
                  buttonText: "Pogledaj sadržaje",
                  targetPageId: "page-teen"
                },
                {
                  id: "lib-3",
                  number: "03",
                  title: "Gotovi šabloni",
                  description: "Praktični šabloni, planeri i radni listovi za brzu primenu.",
                  buttonText: "Pogledaj šablone",
                  targetPageId: "page-templates"
                },
                {
                  id: "lib-4",
                  number: "04",
                  title: "Digitalni proizvodi",
                  description: "E-knjige, vodiči, paketi i digitalna rešenja za razvoj.",
                  buttonText: "Otkrij proizvode",
                  targetPageId: "page-products"
                },
                {
                  id: "lib-5",
                  number: "05",
                  title: "Marketing programi",
                  description: "Sistemi, alati i strategije za organizovan marketing i prodaju.",
                  buttonText: "Pogledaj programe",
                  targetPageId: "page-marketing"
                },
                {
                  id: "lib-6",
                  number: "06",
                  title: "Partnerski programi",
                  description: "Resursi i mogućnosti za partnersku saradnju.",
                  buttonText: "Saznaj više",
                  targetPageId: "page-partners"
                }
              ]
            }
          }),
          createBlock("cta"),
          createBlock("footer")
        ]
      },
      {
        id: "page-women",
        title: "Ženski programi",
        slug: "/zenski-programi",
        blocks: [
          createBlock("header"),
          createBlock("text", {
            props: {
              heading: "Ženski programi — Lični razvoj i ravnoteža",
              body: "Ovde se nalazi detaljno objašnjenje za ženske programe, ritam dana i praktične alate."
            }
          }),
          createBlock("footer")
        ]
      },
      {
        id: "page-teen",
        title: "Tinejdžerski i dečji programi",
        slug: "/programi-za-mlade",
        blocks: [
          createBlock("header"),
          createBlock("text", {
            props: {
              heading: "Tinejdžerski i dečji programi",
              body: "Materijali i radionice prilagođeni mladima, učenju i kreativnom razvoju."
            }
          }),
          createBlock("footer")
        ]
      },
      {
        id: "page-templates",
        title: "Gotovi šabloni",
        slug: "/gotovi-sabloni",
        blocks: [
          createBlock("header"),
          createBlock("text", {
            props: {
              heading: "Gotovi šabloni i planeri",
              body: "Praktični šabloni i radni listovi koje možeš odmah prilagoditi i koristiti."
            }
          }),
          createBlock("footer")
        ]
      },
      {
        id: "page-products",
        title: "Digitalni proizvodi",
        slug: "/digitalni-proizvodi",
        blocks: [
          createBlock("header"),
          createBlock("text", {
            props: {
              heading: "Digitalni proizvodi",
              body: "Detaljan opis e-knjiga, vodiča i digitalnih paketa."
            }
          }),
          createBlock("footer")
        ]
      },
      {
        id: "page-marketing",
        title: "Marketing programi",
        slug: "/marketing-programi",
        blocks: [
          createBlock("header"),
          createBlock("text", {
            props: {
              heading: "Marketing programi i sistemi",
              body: "Praktični sistemi, AI alati i strategije za organizovanu prodaju."
            }
          }),
          createBlock("footer")
        ]
      },
      {
        id: "page-partners",
        title: "Partnerski programi",
        slug: "/partnerski-programi",
        blocks: [
          createBlock("header"),
          createBlock("text", {
            props: {
              heading: "Partnerski programi",
              body: "Informacije o resursima i mogućnostima partnerske saradnje."
            }
          }),
          createBlock("footer")
        ]
      }
    ]
  };
}
