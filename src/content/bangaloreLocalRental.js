/**
 * /services/local/bangalore — "Car Rental in Bangalore with Driver" (sub-page of Car Rental / Local).
 * All copy for the page lives here. Inline syntax: **bold** and [link text](/path).
 * Links from the brief were made relative; /cities/bangalore (no such page) → /bangalore/car-rental,
 * /services/airport-transfer (301 redirect) → /services/airport-taxi.
 */
export const BLR_LOCAL = {
  seo: {
    title: "Car Rental in Bangalore with Driver | Hourly Packages | Abhi Cabs 24×7",
    description: "Book a chauffeur-driven car rental in Bangalore with Abhi Cabs 24×7. Choose 4-hour, 8-hour or 12-hour local packages for shopping, meetings, sightseeing and city travel.",
  },
  breadcrumb: [["Home", "/"], ["Services", "/services"], ["Car Rental", "/services/local"], ["Bangalore", null]],

  hero: {
    h1: "Car Rental in Bangalore with Driver – Abhi Cabs 24×7",
    h2: "Book Comfortable Local Car Rentals in Bangalore",
    body: [
      "Looking for a reliable **car rental in Bangalore**? **Abhi Cabs 24×7** offers convenient chauffeur-driven cars for shopping, office meetings, sightseeing, family outings and everyday city travel.",
      "Choose from **4-hour, 8-hour and 12-hour local car rental packages** with comfortable vehicles and experienced drivers. Whether you need a rental car for a few hours or a full day, choose an option that suits your schedule.",
      "Explore our [local car rental services](/services/local) for more booking options.",
    ],
    cta: "Book Your Bangalore Rental Car",
    image: "/images/hero-local-chauffeur.webp",
    imageAlt: "Abhi Cabs chauffeur with a white Innova in Bangalore",
  },

  packages: {
    heading: "Hourly Car Rental Packages in Bangalore",
    items: [
      { hours: 4, pkg: "4 hrs / 40 km", title: "4-Hour Car Rental in Bangalore", desc: "Suitable for shopping, short office meetings, hospital appointments and personal visits within Bangalore." },
      { hours: 8, pkg: "8 hrs / 80 km", title: "8-Hour Car Rental in Bangalore", desc: "Choose an 8-hour rental for city sightseeing, multiple business appointments, shopping and family outings." },
      { hours: 12, pkg: "12 hrs / 120 km", title: "12-Hour Car Rental in Bangalore", desc: "Explore a 12-hour rental for extended sightseeing, business schedules, family functions and full-day city travel." },
    ],
    note: "Check included kilometres, extra-hour charges, extra-kilometre rates, tolls and parking fees before booking.",
    cta: "Check Hourly Rental Packages",
  },

  vehicles: {
    heading: "Choose Your Car Rental in Bangalore",
    subheading: "Comfortable Cars for Individuals, Families & Groups",
    intro: "**Abhi Cabs 24×7** offers a range of chauffeur-driven vehicles for different travel needs.",
    items: [
      { name: "Swift Dzire", type: "Sedan", image: "/images/coastal-road-sedan.jpg", desc: "Suitable for personal travel, office meetings and small families." },
      { name: "Ertiga", type: "MUV", image: "/images/ertiga.jpg", fit: "contain", desc: "Convenient for family outings and additional passenger space." },
      { name: "Innova", type: "MUV", image: "/images/hero-hill-road-900.webp", desc: "Suitable for spacious family and business travel." },
      { name: "Innova Hycross", type: "Premium MUV", image: "/images/tea-garden-road.jpg", desc: "Comfortable options for premium family and business journeys." },
      { name: "Tempo Traveller & Force Urbania", type: "Group", image: "/images/who-we-are-fleet.webp", crop: { x: 59, y: 56, zoom: 2.3 }, desc: "Available for larger groups, subject to rental requirements and availability." },
    ],
    link: "Explore our [complete cab fleet](/fleet) to compare suitable vehicle options.",
    cta: "Explore Available Rental Cars",
  },

  services: {
    heading: "Local Car Rental Services for Every Travel Need",
    items: [
      {
        title: "Bangalore Sightseeing Car Rental", image: "/images/weekend.webp", journey: { tripType: "local", package: "8 hrs / 80 km" },
        body: [
          "Planning a city tour? Book a **Bangalore sightseeing car rental** for Lalbagh, Cubbon Park, Bangalore Palace, ISKCON Temple and other popular attractions.",
          "For additional travel ideas, explore our [Bangalore sightseeing and cab booking guide](/bangalore/car-rental).",
        ],
      },
      {
        title: "Corporate Car Rental in Bangalore", image: "/images/corporate.webp", journey: { tripType: "local" },
        body: [
          "Hire a chauffeur-driven car for business meetings, client visits, office appointments and work-related travel.",
          "Explore our [corporate cab rental services](/services/corporate) for business transportation.",
        ],
      },
      {
        title: "Shopping & Family Travel", image: "/images/family.webp", journey: { tripType: "local", package: "4 hrs / 40 km" },
        body: [
          "Choose an **hourly car rental in Bangalore** for shopping at Commercial Street, Brigade Road, MG Road and other popular areas.",
          "Local car rentals are also suitable for family functions, hospital appointments and multiple-stop personal journeys.",
        ],
      },
    ],
  },

  locations: {
    heading: "Car Rental in Popular Bangalore Locations",
    subheading: "Find Chauffeur-Driven Car Hire Near Your Pickup Area",
    body: [
      "Check **local car rental availability in Bangalore** from supported areas, including Whitefield, Marathahalli, Electronic City, Koramangala, HSR Layout, Indiranagar, Jayanagar, JP Nagar, Hebbal, Yelahanka, Malleshwaram, Rajajinagar, Bellandur and Sarjapur Road.",
      "Enter your exact pickup location, preferred rental date and package duration to explore available vehicles.",
    ],
    areas: ["Whitefield", "Marathahalli", "Electronic City", "Koramangala", "HSR Layout", "Indiranagar", "Jayanagar", "JP Nagar", "Hebbal", "Yelahanka", "Malleshwaram", "Rajajinagar", "Bellandur", "Sarjapur Road"],
  },

  why: {
    heading: "Why Choose Abhi Cabs 24×7 for Bangalore Car Rentals?",
    subheading: "Convenient Local Travel with Professional Drivers",
    items: [
      { icon: "car", title: "Chauffeur-Driven Cars", desc: "Travel without driving yourself through Bangalore traffic." },
      { icon: "clock", title: "Flexible Hourly Rentals", desc: "Choose 4-hour, 8-hour or 12-hour packages." },
      { icon: "users", title: "Multiple Vehicle Options", desc: "Explore sedans, SUVs and group vehicles." },
      { icon: "pin", title: "Local Sightseeing", desc: "Visit popular attractions according to your itinerary." },
      { icon: "briefcase", title: "Business & Personal Travel", desc: "Suitable for meetings, appointments, shopping and family outings." },
      { icon: "headset", title: "Booking Assistance", desc: "Contact Abhi Cabs 24×7 for rental enquiries and vehicle availability." },
    ],
  },

  prices: {
    heading: "Bangalore Car Rental Prices & Package Details",
    subheading: "Check Your Rental Fare Before Booking",
    body: [
      "**Car rental prices in Bangalore** depend on your chosen vehicle, rental duration, included kilometres and applicable additional charges.",
      "Before confirming your booking, review package hours, kilometre limits, extra-hour rates, extra-distance charges, parking fees, tolls and cancellation conditions.",
    ],
    checklist: ["Package hours", "Kilometre limits", "Extra-hour rates", "Extra-distance charges", "Parking fees", "Tolls", "Cancellation conditions"],
    cta: "Check Bangalore Car Rental Prices",
  },

  more: {
    heading: "Need Airport or Outstation Cabs from Bangalore?",
    subheading: "Explore More Travel Services with Abhi Cabs 24×7",
    intro: "Local car rental packages are designed mainly for travel within Bangalore. For other journey types, explore these dedicated services:",
    links: [
      { kind: "airport", label: "Bangalore airport taxi booking", href: "/services/airport-taxi", desc: "for airport pickup and drop-off." },
      { kind: "oneway", label: "One-way outstation cab services", href: "/services/one-way-outstation", desc: "for intercity journeys without a planned return." },
      { kind: "round", label: "Round-trip cab booking services", href: "/services/round-trip", desc: "for weekend trips, family holidays and return journeys." },
    ],
  },

  how: {
    heading: "How to Book a Car Rental in Bangalore Online",
    subheading: "Book Your Rental Car in Three Easy Steps",
    steps: [
      { title: "Step 1 – Enter Your Travel Details", desc: "Select your Bangalore pickup location, rental date and preferred pickup time." },
      { title: "Step 2 – Choose Your Rental Package", desc: "Choose a 4-hour, 8-hour or 12-hour rental and explore suitable vehicle options." },
      { title: "Step 3 – Review & Confirm", desc: "Check your vehicle, included kilometres, fare and applicable booking conditions before confirming." },
    ],
    ctaLabel: "Book Your Bangalore Rental Car",
  },

  faqHeading: "Frequently Asked Questions About Car Rental in Bangalore",
  faqs: [
    ["How can I book a car rental in Bangalore?", "Visit **abhicabs24x7.com**, enter your travel details, choose a rental package and explore available vehicles."],
    ["Does Abhi Cabs 24×7 provide car rentals with drivers?", "Yes. Abhi Cabs 24×7 offers **chauffeur-driven car rental options in Bangalore** for local travel, business meetings, shopping and sightseeing."],
    ["Are hourly car rental packages available in Bangalore?", "Yes. Abhi Cabs 24×7 features **4-hour, 8-hour and 12-hour rental options**, subject to vehicle availability."],
    ["Can I rent a car in Bangalore for a full day?", "Yes. You can explore a **12-hour local rental** for extended sightseeing, family functions and business travel."],
    ["What is the price of car rental in Bangalore?", "Rental prices depend on the vehicle category, package duration, included kilometres and additional charges. Check current fares before booking."],
    ["Which cars are available for Bangalore rentals?", "Depending on availability, choose from Swift Dzire, Ertiga, Innova, Innova Hycross and other suitable vehicles."],
    ["Can I book a car for Bangalore sightseeing?", "Yes. You can request a local rental for attractions such as Lalbagh, Cubbon Park, Bangalore Palace and ISKCON Temple."],
    ["Can I use an hourly car rental for multiple stops?", "Yes. Hourly rentals are suitable for multiple-stop city journeys within your chosen package's time and kilometre limits."],
    ["Are airport and outstation trips included in local rental packages?", "Local rental packages are mainly intended for city travel. Airport and outstation journeys may require separate booking options."],
    ["Are tolls, parking fees and additional kilometres included?", "Package inclusions vary. Review kilometre limits, tolls, parking charges, extra-hour fees and other applicable costs before booking."],
  ],

  cta: {
    heading: "Book Your Car Rental in Bangalore with Abhi Cabs 24×7",
    subheading: "Hourly Car Rentals, Local Sightseeing & City Travel Made Easy",
    body: [
      "Looking for a **car rental in Bangalore with driver**? **Abhi Cabs 24×7** offers convenient local rental options for shopping, business meetings, sightseeing, personal appointments and family travel.",
      "Choose your pickup location, select your preferred package and explore available vehicles for your journey.",
    ],
    button: "Book Your Bangalore Car Rental Now",
  },
};
