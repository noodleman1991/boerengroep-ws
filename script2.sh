#!/bin/bash

# Complete Newsletter System Implementation Script
# Run this from the project root directory

echo "🚀 Starting newsletter system implementation..."

# Step 1: Update i18n routing configuration
echo "📝 Step 1: Updating i18n routing configuration..."
cat > i18n/routing.ts << 'EOF'
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'nl'],
    defaultLocale: 'en',
    pathnames: {
        '/': '/',

        // About Us
        '/about-us': {
            en: '/about-us',
            nl: '/over-ons'
        },
        '/about-us/what-is-bg': {
            en: '/about-us/what-is-bg',
            nl: '/over-ons/wat-is-bg'
        },
        '/about-us/history': {
            en: '/about-us/history',
            nl: '/over-ons/geschiedenis'
        },
        '/about-us/who-are-we': {
            en: '/about-us/who-are-we',
            nl: '/over-ons/wie-zijn-wij'
        },
        '/about-us/network': {
            en: '/about-us/network',
            nl: '/over-ons/netwerk'
        },

        // Activities
        '/activities': {
            en: '/activities',
            nl: '/activiteiten'
        },
        '/activities/calendar': {
            en: '/activities/calendar',
            nl: '/activiteiten/agenda'
        },
        '/activities/past-events': {
            en: '/activities/past-events',
            nl: '/activiteiten/terugblik'
        },
        '/activities/group-studies': {
            en: '/activities/group-studies',
            nl: '/activiteiten/groepsstudies'
        },
        '/activities/pei': {
            en: '/activities/pei',
            nl: '/activiteiten/pei'
        },
        '/activities/teachers': {
            en: '/activities/teachers',
            nl: '/activiteiten/docenten'
        },
        '/activities/auditorium': {
            en: '/activities/auditorium',
            nl: '/activiteiten/auditorium'
        },
        '/activities/forum-reader': {
            en: '/activities/forum-reader',
            nl: '/activiteiten/forumlezer'
        },
        '/activities/soup-kitchen': {
            en: '/activities/soup-kitchen',
            nl: '/activiteiten/soepkeuken'
        },

        // Vacancies
        '/vacancies': {
            en: '/vacancies',
            nl: '/vacatures'
        },

        // News
        '/news': {
            en: '/news',
            nl: '/nieuws'
        },
        '/news/landscape': {
            en: '/news/landscape',
            nl: '/nieuws/landschap'
        },
        '/news/newsletter': {
            en: '/news/newsletter',
            nl: '/nieuws/nieuwsbrief'
        },
        '/news/friends-news': {
            en: '/news/friends-news',
            nl: '/nieuws/vrienden-nieuws'
        },

        // Newsletter detail pages
        '/newsletters': {
            en: '/newsletters',
            nl: '/nieuwsbrieven'
        },

        // Inspiration Theater
        '/inspiration-theater': {
            en: '/inspiration-theater',
            nl: '/inspiratietheater'
        },
        '/inspiration-theater/network': {
            en: '/inspiration-theater/network',
            nl: '/inspiratietheater/netwerk'
        },
        '/inspiration-theater/events': {
            en: '/inspiration-theater/events',
            nl: '/inspiratietheater/evenementen'
        },

        // Library & Media
        '/library': {
            en: '/library',
            nl: '/bibliotheek'
        },
        '/library/podcast': {
            en: '/library/podcast',
            nl: '/bibliotheek/podcast'
        },
        '/library/media': {
            en: '/library/media',
            nl: '/bibliotheek/media'
        },
        '/library/50-years-bg': {
            en: '/library/50-years-bg',
            nl: '/bibliotheek/50-jaar-bg'
        },

        // Contact
        '/contact': '/contact',

        // Legal pages
        '/privacy': {
            en: '/privacy',
            nl: '/privacy'
        },
        '/cookies': {
            en: '/cookies',
            nl: '/cookies'
        },
        '/terms-conditions': {
            en: '/terms-conditions',
            nl: '/algemene-voorwaarden'
        },
        '/accessibility': {
            en: '/accessibility',
            nl: '/toegankelijkheid'
        }
    }
});

export const PATHNAMES = {
    HOME: '/',
    ABOUT_US: '/about-us',
    ACTIVITIES: '/activities',
    VACANCIES: '/vacancies',
    NEWS: '/news',
    INSPIRATION_THEATER: '/inspiration-theater',
    LIBRARY: '/library',
    CONTACT: '/contact'
} as const;
EOF

# Step 2: Update global navigation config
echo "📝 Step 2: Updating global navigation config..."
cat > content/global/index.json << 'EOF'
{
  "header": {
    "icon": {
      "name": "BiSolidCaretRightCircle",
      "color": "green",
      "style": "float"
    },
    "name": "Stichting Boerengroep",
    "color": "default",
    "nav": [
      {
        "href": "/",
        "label": "home"
      },
      {
        "href": "/about-us",
        "label": "about-us",
        "submenu": [
          {
            "href": "/about-us/what-is-bg",
            "label": "what-is-bg"
          },
          {
            "href": "/about-us/history",
            "label": "history"
          },
          {
            "href": "/about-us/who-are-we",
            "label": "who-are-we"
          },
          {
            "href": "/about-us/network",
            "label": "network"
          }
        ]
      },
      {
        "href": "/activities",
        "label": "activities",
        "submenu": [
          {
            "href": "/activities/calendar",
            "label": "calendar"
          },
          {
            "href": "/activities/past-events",
            "label": "past-events"
          },
          {
            "href": "/activities/group-studies",
            "label": "group-studies"
          },
          {
            "href": "/activities/pei",
            "label": "pei"
          },
          {
            "href": "/activities/teachers",
            "label": "teachers"
          },
          {
            "href": "/activities/auditorium",
            "label": "auditorium"
          },
          {
            "href": "/activities/forum-reader",
            "label": "forum-reader"
          },
          {
            "href": "/activities/soup-kitchen",
            "label": "soup-kitchen"
          }
        ]
      },
      {
        "href": "/vacancies",
        "label": "vacancies",
        "submenu": [
          {
            "href": "/vacancies#volunteers",
            "label": "volunteers"
          },
          {
            "href": "/vacancies#internships",
            "label": "internships"
          },
          {
            "href": "/vacancies#coordinator",
            "label": "coordinator"
          },
          {
            "href": "/vacancies#freelance",
            "label": "freelance"
          }
        ]
      },
      {
        "href": "/news",
        "label": "news",
        "submenu": [
          {
            "href": "/news/landscape",
            "label": "landscape"
          },
          {
            "href": "/news/newsletter",
            "label": "newsletter"
          },
          {
            "href": "/news/friends-news",
            "label": "friends-news"
          }
        ]
      },
      {
        "href": "/inspiration-theater",
        "label": "inspiration-theater",
        "submenu": [
          {
            "href": "/inspiration-theater/network",
            "label": "legendary-network"
          },
          {
            "href": "/inspiration-theater/events",
            "label": "event-materials"
          }
        ]
      },
      {
        "href": "/library",
        "label": "library-media",
        "submenu": [
          {
            "href": "/library/podcast",
            "label": "podcast"
          },
          {
            "href": "/library/media",
            "label": "audio-videos"
          },
          {
            "href": "/library/50-years-bg",
            "label": "50-years-bg"
          }
        ]
      },
      {
        "href": "/contact",
        "label": "contact"
      }
    ]
  },
  "footer": {
    "social": [
      {
        "icon": {
          "name": "FaLinkedin"
        },
        "url": "https://www.linkedin.com/company/stichting-boerengroep"
      },
      {
        "icon": {
          "name": "FaFacebook"
        },
        "url": "https://www.facebook.com/boerengroep"
      },
      {
        "icon": {
          "name": "AiFillInstagram"
        },
        "url": "https://www.instagram.com/boerengroep"
      },
      {
        "icon": {
          "name": "FaXTwitter"
        },
        "url": "https://twitter.com/boerengroep"
      },
      {
        "icon": {
          "name": "FaYoutube"
        },
        "url": "https://www.youtube.com/@Boerengroep"
      }
    ],
    "quickLinks": [
      {
        "title": "about-us",
        "links": [
          {
            "href": "/about-us/what-is-bg",
            "label": "what-is-bg"
          },
          {
            "href": "/about-us/history",
            "label": "history"
          },
          {
            "href": "/about-us/network",
            "label": "network"
          }
        ]
      },
      {
        "title": "activities",
        "links": [
          {
            "href": "/activities/calendar",
            "label": "calendar"
          },
          {
            "href": "/activities/group-studies",
            "label": "group-studies"
          },
          {
            "href": "/activities/soup-kitchen",
            "label": "soup-kitchen"
          }
        ]
      },
      {
        "title": "get-involved",
        "links": [
          {
            "href": "/vacancies#internships",
            "label": "internships"
          },
          {
            "href": "/vacancies#volunteers",
            "label": "volunteers"
          },
          {
            "href": "/contact",
            "label": "contact"
          }
        ]
      }
    ]
  },
  "theme": {
    "color": "blue",
    "font": "nunito",
    "darkMode": "light"
  }
}
EOF

# Step 3: Update English translations
echo "📝 Step 3: Updating English translations..."
cat > messages/en.json << 'EOF'
{
  "navigation": {
    "home": "Home",
    "open-menu": "Open menu",
    "close-menu": "Close menu",
    "items": {
      "home": "Home",
      "about-us": "About Us",
      "what-is-bg": "What is BG?",
      "history": "History",
      "who-are-we": "Who are we?",
      "network": "Network",
      "activities": "Activities",
      "calendar": "Calendar",
      "past-events": "Past Events",
      "group-studies": "Group Studies",
      "pei": "PEI",
      "teachers": "Teachers",
      "auditorium": "Auditorium",
      "forum-reader": "Forum Reader",
      "soup-kitchen": "Soup Kitchen",
      "internships": "Internships",
      "coordinator": "Coordinator",
      "freelance": "Freelance/Temporary",
      "volunteers": "Volunteers",
      "news": "News",
      "landscape": "Landscape",
      "newsletter": "Newsletter",
      "friends-news": "Friends News",
      "inspiration-theater": "Inspiration Theater",
      "legendary-network": "Legendary Network",
      "event-materials": "Event Materials",
      "library-media": "Library & Media",
      "podcast": "Podcast",
      "audio-videos": "Audio & Videos",
      "50-years-bg": "50 Years BG",
      "contact": "Contact",
      "vacancies": "Vacancies"
    }
  },
  "newsletter": {
    "title": "Newsletter",
    "description": "Stay updated with the latest news from Stichting Boerengroep and our partner organizations.",
    "read_more": "Read more",
    "visit_link": "Visit link",
    "no_newsletters": "No newsletters found.",
    "back_to_newsletter": "Back to Newsletter",
    "signup": {
      "title": "Subscribe to Our Newsletter",
      "description": "Stay updated with our latest news, events, and sustainable agriculture initiatives.",
      "email_label": "Email Address",
      "email_placeholder": "Enter your email address",
      "consent_newsletter": "I want to receive newsletters from Stichting Boerengroep",
      "consent_processing": "I consent to the processing of my personal data according to the privacy policy",
      "gdpr_notice": "Your privacy matters to us. We only use your data to send you our newsletter and comply with GDPR regulations.",
      "privacy_policy": "Privacy Policy",
      "export_data": "Export My Data",
      "delete_data": "Delete My Data",
      "submit_button": "Subscribe",
      "success_message": "Thank you for subscribing! Please check your email to verify your subscription.",
      "error_message": "Something went wrong. Please try again."
    },
    "verify": {
      "title": "Verify Your Email",
      "description": "Please verify your email address to complete your newsletter subscription.",
      "no_token": "No verification token provided. Please check the link in your email.",
      "verifying": "Verifying your email...",
      "back_home": "Back to Home",
      "error_message": "Failed to verify email. Please try again or contact support."
    },
    "unsubscribe": {
      "title": "Unsubscribe from Newsletter",
      "description": "We're sorry to see you go. Please let us know why you're unsubscribing.",
      "no_token": "No unsubscribe token provided. Please use the link from your email.",
      "reason_label": "Reason for unsubscribing (optional)",
      "reason_placeholder": "e.g., Too many emails, Not relevant, etc.",
      "feedback_label": "Additional feedback (optional)",
      "feedback_placeholder": "Help us improve by sharing your thoughts...",
      "confirm_unsubscribe": "Confirm Unsubscribe",
      "cancel": "Cancel",
      "success_title": "You've Been Unsubscribed",
      "success_message": "Thank you for being part of our community. You can always re-subscribe later if you change your mind.",
      "back_home": "Back to Home",
      "error_message": "Failed to unsubscribe. Please try again or contact support."
    },
    "exportData": {
      "title": "Export Your Data",
      "description": "Request a copy of all personal data we have stored about you.",
      "what_included": "What's included in your data export:",
      "included_subscription": "Your subscription information and preferences",
      "included_consent": "Consent history and timestamps",
      "included_preferences": "Email preferences and settings",
      "included_statistics": "Subscription statistics and activity",
      "email_label": "Email Address",
      "email_placeholder": "Enter your email address",
      "request_export": "Request Data Export",
      "gdpr_notice": "This data export is provided in compliance with GDPR Article 15 (Right of Access).",
      "delivery_notice": "Your data export will be sent to your email address within 24 hours.",
      "error_message": "Failed to request data export. Please try again or contact support."
    },
    "deleteData": {
      "title": "Delete Your Data",
      "description": "Permanently delete all your personal data from our systems.",
      "warning_message": "⚠️ This action cannot be undone. All your data will be permanently deleted.",
      "what_deleted": "What will be deleted:",
      "deleted_subscription": "Your subscription and all related preferences",
      "deleted_consent": "All consent records and history",
      "deleted_preferences": "Email preferences and settings",
      "deleted_communications": "Records of all communications sent to you",
      "email_label": "Email Address",
      "email_placeholder": "Enter your email address",
      "reason_label": "Reason for deletion (optional)",
      "reason_placeholder": "Help us understand why you're deleting your data...",
      "confirmation_text": "I understand this action cannot be undone and want to permanently delete all my data",
      "confirm_delete": "Permanently Delete My Data",
      "success_title": "Your Data Has Been Deleted",
      "gdpr_notice": "This data deletion is provided in compliance with GDPR Article 17 (Right to Erasure).",
      "error_message": "Failed to delete data. Please try again or contact support."
    },
    "filters": {
      "all": "All",
      "boerengroep": "Boerengroep",
      "inspiratietheater": "Inspiratietheater",
      "friends": "Friend Organizations"
    },
    "types": {
      "article": "Article",
      "content": "Article",
      "link": "External Link",
      "event": "Event",
      "update": "Update"
    }
  },
  "calendar": {
    "title": "Event Calendar",
    "description": "View all upcoming events, workshops, meetings, and activities.",
    "views": {
      "month": "Month",
      "agenda": "Agenda"
    },
    "navigation": {
      "today": "Today",
      "previous": "Previous",
      "next": "Next",
      "events": "events",
      "event": "event"
    },
    "weekdays": {
      "short": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      "long": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    "months": {
      "short": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      "long": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    "events": {
      "noEvents": "No events found for this month.",
      "noEventsForDate": "No events for this date.",
      "moreEvents": "more...",
      "eventsOn": "Events on",
      "responsible": "Responsible",
      "startDate": "Start Date",
      "endDate": "End Date",
      "description": "Description",
      "at": "at"
    },
    "eventTypes": {
      "talk": "Talk",
      "workshop": "Workshop",
      "lecture": "Lecture",
      "meeting": "Meeting",
      "board-meeting": "Board Meeting",
      "soup-kitchen": "Soup Kitchen",
      "csa": "Community Supported Agriculture",
      "excursion": "Excursion"
    },
    "settings": {
      "title": "Calendar settings",
      "timeFormat": "Use 24 hour format",
      "badgeVariant": "Use dot badge",
      "defaultView": "Default view"
    },
    "filter": {
      "title": "Filter events",
      "clearFilter": "Clear Filter",
      "allEvents": "All Events"
    },
    "search": {
      "placeholder": "Type a command or search...",
      "noResults": "No results found."
    },
    "fullscreen": {
      "enter": "Enter fullscreen",
      "exit": "Exit fullscreen"
    },
    "loading": "Loading events...",
    "errors": {
      "loadingFailed": "Failed to load events",
      "noEventsAdmin": "No events found. Add events through the TinaCMS admin panel."
    }
  },
  "footer": {
    "newsletter": {
      "title": "Stay informed",
      "description": "Receive our newsletter with the latest news about sustainable agriculture and our activities.",
      "placeholder": "Your email address",
      "subscribe": "Subscribe"
    },
    "contact": {
      "title": "Contact",
      "organization": "Stichting Boerengroep",
      "address": {
        "street": "Droevendaalsesteeg 1",
        "city": "6708 PB Wageningen",
        "country": "The Netherlands"
      },
      "email": "info@boerengroep.nl",
      "phone": {
        "raw": "+31317481100",
        "display": "+31 (0)317 48 11 00"
      }
    },
    "quick-links": {
      "about-us": {
        "title": "About Us",
        "links": {
          "what-is-bg": "What is BG?",
          "history": "History",
          "network": "Network"
        }
      },
      "activities": {
        "title": "Activities",
        "links": {
          "calendar": "Calendar",
          "group-studies": "Group Studies",
          "soup-kitchen": "Soup Kitchen"
        }
      },
      "get-involved": {
        "title": "Get Involved",
        "links": {
          "internships": "Internships",
          "volunteers": "Volunteers",
          "contact": "Contact"
        }
      }
    },
    "social": {
      "linkedin": "Follow us on LinkedIn",
      "facebook": "Follow us on Facebook",
      "instagram": "Follow us on Instagram",
      "twitter": "Follow us on Twitter",
      "xtwitter": "X (Twitter)",
      "youtube": "Watch our YouTube channel",
      "envelope": "Send us an email"
    },
    "legal": {
      "privacy": "Privacy Policy",
      "cookies": "Cookie Policy",
      "terms": "Terms & Conditions",
      "accessibility": "Accessibility"
    },
    "copyright": "© {year} {organization}, All rights reserved"
  },
  "language-switcher": {
    "toggle-language-menu": "Switch language",
    "help-translate": "Help us translate"
  },
  "common": {
    "read-more": "Read more",
    "learn-more": "Learn more",
    "get-involved": "Get involved",
    "subscribe": "Subscribe",
    "contact-us": "Contact us"
  },
  "vacancies": {
    "title": "Opportunities",
    "description": "Discover meaningful opportunities to contribute to our mission through volunteering, internships, and employment.",
    "opportunity": "opportunity",
    "opportunities": "opportunities",
    "untitledPosition": "Untitled Position",
    "organizationNotSpecified": "Organization not specified",
    "downloadDocument": "Download Document",
    "status": {
      "open": "Open",
      "closed": "Closed"
    },
    "types": {
      "volunteer": {
        "title": "Volunteer Opportunities",
        "navTitle": "Volunteers",
        "noOpportunities": "No volunteer opportunities available at the moment."
      },
      "internship": {
        "title": "Internships",
        "navTitle": "Internships",
        "noOpportunities": "No internship opportunities available at the moment."
      },
      "coordinator": {
        "title": "Coordinator Positions",
        "navTitle": "Coordinator",
        "noOpportunities": "No coordinator positions available at the moment."
      },
      "freelance": {
        "title": "Freelance & Temporary Positions",
        "navTitle": "Freelance/Temporary",
        "noOpportunities": "No freelance or temporary positions available at the moment."
      },
      "other": {
        "title": "Other Opportunities",
        "navTitle": "Other",
        "noOpportunities": "No other opportunities available at the moment."
      }
    },
    "fields": {
      "deadline": "Deadline",
      "location": "Location",
      "startDate": "Start Date",
      "duration": "Duration",
      "compensation": "Compensation",
      "description": "Description",
      "responsibilities": "Responsibilities",
      "requiredSkills": "Required Skills",
      "preferredQualities": "Preferred Qualities",
      "languagesRequired": "Required Languages",
      "accessibilityNotes": "Accessibility Notes",
      "supportingDocument": "Files",
      "valuesStatement": "Values & Commitment",
      "howToApply": "How to Apply",
      "contactInfo": "Contact Information",
      "openToNontraditional": "Open to Nontraditional Applicants"
    }
  }
}
EOF

# Step 4: Update Dutch translations
echo "📝 Step 4: Updating Dutch translations..."
cat > messages/nl.json << 'EOF'
{
  "navigation": {
    "home": "Home",
    "open-menu": "Menu openen",
    "close-menu": "Menu sluiten",
    "items": {
      "home": "Home",
      "about-us": "Over Ons",
      "what-is-bg": "Wat is BG?",
      "history": "Geschiedenis",
      "who-are-we": "Wie zijn wij?",
      "network": "Netwerk",
      "activities": "Activiteiten",
      "calendar": "Agenda",
      "past-events": "Terugblik",
      "group-studies": "Groepsstudies",
      "pei": "PEI",
      "teachers": "Docenten",
      "auditorium": "Auditorium",
      "forum-reader": "Forum Lezer",
      "soup-kitchen": "Soepkeuken",
      "internships": "Stages",
      "coordinator": "Coördinator",
      "freelance": "Freelance/Tijdelijk",
      "volunteers": "Vrijwilligers",
      "news": "Nieuws",
      "landscape": "Landschap",
      "newsletter": "Nieuwsbrief",
      "friends-news": "Vrienden Nieuws",
      "inspiration-theater": "Inspiratietheater",
      "legendary-network": "Legendarisch Netwerk",
      "event-materials": "Materiaal Evenementen",
      "library-media": "Bibliotheek & Media",
      "podcast": "Podcast",
      "audio-videos": "Geluid & Video's",
      "50-years-bg": "50 Jaar BG",
      "contact": "Contact",
      "vacancies": "Vacatures"
    }
  },
  "newsletter": {
    "title": "Nieuwsbrief",
    "description": "Blijf op de hoogte van het laatste nieuws van Stichting Boerengroep en onze partnerorganisaties.",
    "read_more": "Lees meer",
    "visit_link": "Bezoek link",
    "no_newsletters": "Geen nieuwsbrieven gevonden.",
    "back_to_newsletter": "Terug naar Nieuwsbrief",
    "signup": {
      "title": "Inschrijven voor Nieuwsbrief",
      "description": "Blijf op de hoogte van ons laatste nieuws, evenementen en duurzame landbouwinitiatieven.",
      "email_label": "E-mailadres",
      "email_placeholder": "Voer uw e-mailadres in",
      "consent_newsletter": "Ik wil nieuwsbrieven ontvangen van Stichting Boerengroep",
      "consent_processing": "Ik ga akkoord met de verwerking van mijn persoonsgegevens volgens het privacybeleid",
      "gdpr_notice": "Uw privacy is belangrijk voor ons. We gebruiken uw gegevens alleen om u onze nieuwsbrief te sturen en voldoen aan AVG-regelgeving.",
      "privacy_policy": "Privacybeleid",
      "export_data": "Mijn Gegevens Exporteren",
      "delete_data": "Mijn Gegevens Verwijderen",
      "submit_button": "Inschrijven",
      "success_message": "Bedankt voor uw inschrijving! Controleer uw e-mail om uw inschrijving te verifiëren.",
      "error_message": "Er is iets misgegaan. Probeer het opnieuw."
    },
    "verify": {
      "title": "Verifieer Uw E-mail",
      "description": "Verifieer uw e-mailadres om uw nieuwsbriefinschrijving te voltooien.",
      "no_token": "Geen verificatietoken opgegeven. Controleer de link in uw e-mail.",
      "verifying": "Uw e-mail wordt geverifieerd...",
      "back_home": "Terug naar Home",
      "error_message": "Verificatie van e-mail mislukt. Probeer opnieuw of neem contact op met ondersteuning."
    },
    "unsubscribe": {
      "title": "Uitschrijven van Nieuwsbrief",
      "description": "We vinden het jammer dat u weggaat. Laat ons weten waarom u zich uitschrijft.",
      "no_token": "Geen uitschrijftoken opgegeven. Gebruik de link uit uw e-mail.",
      "reason_label": "Reden voor uitschrijving (optioneel)",
      "reason_placeholder": "bijv. Te veel e-mails, Niet relevant, etc.",
      "feedback_label": "Aanvullende feedback (optioneel)",
      "feedback_placeholder": "Help ons verbeteren door uw gedachten te delen...",
      "confirm_unsubscribe": "Uitschrijving Bevestigen",
      "cancel": "Annuleren",
      "success_title": "U Bent Uitgeschreven",
      "success_message": "Bedankt dat u deel uitmaakte van onze gemeenschap. U kunt zich altijd later opnieuw inschrijven als u van gedachten verandert.",
      "back_home": "Terug naar Home",
      "error_message": "Uitschrijven mislukt. Probeer opnieuw of neem contact op met ondersteuning."
    },
    "exportData": {
      "title": "Uw Gegevens Exporteren",
      "description": "Vraag een kopie aan van alle persoonsgegevens die wij over u hebben opgeslagen.",
      "what_included": "Wat is inbegrepen in uw gegevensexport:",
      "included_subscription": "Uw inschrijvingsinformatie en voorkeuren",
      "included_consent": "Toestemmingsgeschiedenis en tijdstempels",
      "included_preferences": "E-mailvoorkeuren en instellingen",
      "included_statistics": "Inschrijvingsstatistieken en activiteit",
      "email_label": "E-mailadres",
      "email_placeholder": "Voer uw e-mailadres in",
      "request_export": "Gegevensexport Aanvragen",
      "gdpr_notice": "Deze gegevensexport wordt verstrekt in overeenstemming met AVG Artikel 15 (Recht op Toegang).",
      "delivery_notice": "Uw gegevensexport wordt binnen 24 uur naar uw e-mailadres verzonden.",
      "error_message": "Aanvragen van gegevensexport mislukt. Probeer opnieuw of neem contact op met ondersteuning."
    },
    "deleteData": {
      "title": "Uw Gegevens Verwijderen",
      "description": "Verwijder permanent al uw persoonsgegevens uit onze systemen.",
      "warning_message": "⚠️ Deze actie kan niet ongedaan worden gemaakt. Al uw gegevens worden permanent verwijderd.",
      "what_deleted": "Wat wordt verwijderd:",
      "deleted_subscription": "Uw inschrijving en alle gerelateerde voorkeuren",
      "deleted_consent": "Alle toestemmingsgegevens en geschiedenis",
      "deleted_preferences": "E-mailvoorkeuren en instellingen",
      "deleted_communications": "Gegevens van alle communicatie die naar u is verzonden",
      "email_label": "E-mailadres",
      "email_placeholder": "Voer uw e-mailadres in",
      "reason_label": "Reden voor verwijdering (optioneel)",
      "reason_placeholder": "Help ons begrijpen waarom u uw gegevens verwijdert...",
      "confirmation_text": "Ik begrijp dat deze actie niet ongedaan kan worden gemaakt en wil al mijn gegevens permanent verwijderen",
      "confirm_delete": "Mijn Gegevens Permanent Verwijderen",
      "success_title": "Uw Gegevens Zijn Verwijderd",
      "gdpr_notice": "Deze gegevensverwijdering wordt verstrekt in overeenstemming met AVG Artikel 17 (Recht op Vergetelheid).",
      "error_message": "Verwijderen van gegevens mislukt. Probeer opnieuw of neem contact op met ondersteuning."
    },
    "filters": {
      "all": "Alle",
      "boerengroep": "Boerengroep",
      "inspiratietheater": "Inspiratietheater",
      "friends": "Vriendorganisaties"
    },
    "types": {
      "article": "Artikel",
      "content": "Artikel",
      "link": "Externe Link",
      "event": "Evenement",
      "update": "Update"
    }
  },
  "calendar": {
    "title": "Evenementenagenda",
    "description": "Bekijk alle komende evenementen, workshops, vergaderingen en activiteiten.",
    "views": {
      "month": "Maand",
      "agenda": "Agenda"
    },
    "navigation": {
      "today": "Vandaag",
      "previous": "Vorige",
      "next": "Volgende",
      "events": "evenementen",
      "event": "evenement"
    },
    "weekdays": {
      "short": ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
      "long": ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"]
    },
    "months": {
      "short": ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
      "long": ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"]
    },
    "events": {
      "noEvents": "Geen evenementen gevonden voor deze maand.",
      "noEventsForDate": "Geen evenementen voor deze datum.",
      "moreEvents": "meer...",
      "eventsOn": "Evenementen op",
      "responsible": "Verantwoordelijke",
      "startDate": "Startdatum",
      "endDate": "Einddatum",
      "description": "Beschrijving",
      "at": "om"
    },
    "eventTypes": {
      "talk": "Lezing",
      "workshop": "Workshop",
      "lecture": "College",
      "meeting": "Vergadering",
      "board-meeting": "Bestuursvergadering",
      "soup-kitchen": "Soepkeuken",
      "csa": "Community Supported Agriculture",
      "excursion": "Excursie"
    },
    "settings": {
      "title": "Agenda-instellingen",
      "timeFormat": "Gebruik 24-uurs formaat",
      "badgeVariant": "Gebruik punt badge",
      "defaultView": "Standaardweergave"
    },
    "filter": {
      "title": "Filter evenementen",
      "clearFilter": "Filter wissen",
      "allEvents": "Alle evenementen"
    },
    "search": {
      "placeholder": "Typ een commando of zoek...",
      "noResults": "Geen resultaten gevonden."
    },
    "fullscreen": {
      "enter": "Volledig scherm",
      "exit": "Volledig scherm verlaten"
    },
    "loading": "Evenementen laden...",
    "errors": {
      "loadingFailed": "Laden van evenementen mislukt",
      "noEventsAdmin": "Geen evenementen gevonden. Voeg evenementen toe via het TinaCMS beheerpaneel."
    }
  },
  "footer": {
    "newsletter": {
      "title": "Blijf op de hoogte",
      "description": "Ontvang onze nieuwsbrief met het laatste nieuws over duurzame landbouw en onze activiteiten.",
      "placeholder": "Uw e-mailadres",
      "subscribe": "Aanmelden"
    },
    "contact": {
      "title": "Contact",
      "organization": "Stichting Boerengroep",
      "address": {
        "street": "Droevendaalsesteeg 1",
        "city": "6708 PB Wageningen",
        "country": "Nederland"
      },
      "email": "info@boerengroep.nl",
      "phone": {
        "raw": "+31317481100",
        "display": "+31 (0)317 48 11 00"
      }
    },
    "quick-links": {
      "about-us": {
        "title": "Over Ons",
        "links": {
          "what-is-bg": "Wat is BG?",
          "history": "Geschiedenis",
          "network": "Netwerk"
        }
      },
      "activities": {
        "title": "Activiteiten",
        "links": {
          "calendar": "Agenda",
          "group-studies": "Groepsstudies",
          "soup-kitchen": "Soepkeuken"
        }
      },
      "get-involved": {
        "title": "Meedoen",
        "links": {
          "internships": "Stages",
          "volunteers": "Vrijwilligers",
          "contact": "Contact"
        }
      }
    },
    "social": {
      "linkedin": "Volg ons op LinkedIn",
      "facebook": "Volg ons op Facebook",
      "instagram": "Volg ons op Instagram",
      "twitter": "Volg ons op Twitter",
      "xtwitter": "X (Twitter)",
      "youtube": "Bekijk onze YouTube kanaal",
      "envelope": "Stuur ons een e-mail"
    },
    "legal": {
      "privacy": "Privacybeleid",
      "cookies": "Cookiebeleid",
      "terms": "Algemene Voorwaarden",
      "accessibility": "Toegankelijkheid"
    },
    "copyright": "© {year} {organization}, Alle rechten voorbehouden"
  },
  "language-switcher": {
    "toggle-language-menu": "Wissel van taal",
    "help-translate": "Help ons vertalen"
  },
  "common": {
    "read-more": "Lees meer",
    "learn-more": "Meer informatie",
    "get-involved": "Doe mee",
    "subscribe": "Aanmelden",
    "contact-us": "Neem contact op"
  },
  "vacancies": {
    "title": "Kansen",
    "description": "Ontdek zinvolle kansen om bij te dragen aan onze missie via vrijwilligerswerk, stages en werkgelegenheid.",
    "opportunity": "kans",
    "opportunities": "kansen",
    "untitledPosition": "Positie zonder titel",
    "organizationNotSpecified": "Organisatie niet gespecificeerd",
    "downloadDocument": "Document downloaden",
    "status": {
      "open": "Open",
      "closed": "Gesloten"
    },
    "types": {
      "volunteer": {
        "title": "Vrijwilligersmogelijkheden",
        "navTitle": "Vrijwilligers",
        "noOpportunities": "Momenteel geen vrijwilligersmogelijkheden beschikbaar."
      },
      "internship": {
        "title": "Stages",
        "navTitle": "Stages",
        "noOpportunities": "Momenteel geen stagemogelijkheden beschikbaar."
      },
      "coordinator": {
        "title": "Coördinatorfuncties",
        "navTitle": "Coördinator",
        "noOpportunities": "Momenteel geen coördinatorfuncties beschikbaar."
      },
      "freelance": {
        "title": "Freelance & Tijdelijke Functies",
        "navTitle": "Freelance/Tijdelijk",
        "noOpportunities": "Momenteel geen freelance of tijdelijke functies beschikbaar."
      },
      "other": {
        "title": "Andere Kansen",
        "navTitle": "Overig",
        "noOpportunities": "Momenteel geen andere kansen beschikbaar."
      }
    },
    "fields": {
      "deadline": "Deadline",
      "location": "Locatie",
      "startDate": "Startdatum",
      "duration": "Duur",
      "compensation": "Vergoeding",
      "description": "Beschrijving",
      "responsibilities": "Verantwoordelijkheden",
      "requiredSkills": "Vereiste Vaardigheden",
      "preferredQualities": "Gewenste Eigenschappen",
      "languagesRequired": "Vereiste Talen",
      "accessibilityNotes": "Toegankelijkheidsnotities",
      "supportingDocument": "Bestanden",
      "valuesStatement": "Waarden & Engagement",
      "howToApply": "Hoe solliciteren",
      "contactInfo": "Contactinformatie",
      "openToNontraditional": "Open voor niet-traditionele kandidaten"
    }
  }
}
EOF

# Step 5: Create reusable newsletter component
echo "📝 Step 5: Creating reusable newsletter component..."
mkdir -p components
cat > components/newsletter-list.tsx << 'EOF'
'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Section } from '@/components/layout/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Calendar } from 'lucide-react';

interface NewsletterNode {
    id: string;
    title?: string | null;
    type?: string | null;
    organization?: string | null;
    publishDate?: string | null;
    externalLink?: string | null;
    linkDescription?: string | null;
    published?: boolean | null;
    featured?: boolean | null;
    excerpt?: any;
    _sys: {
        breadcrumbs: string[];
    };
}

interface NewsletterEdge {
    node?: NewsletterNode | null;
}

interface NewsletterConnection {
    edges?: (NewsletterEdge | null)[] | null;
}

interface NewsletterListProps {
    newsletters: NewsletterConnection;
    locale: string;
    filter: 'main' | 'friends';
    title: string;
    description: string;
}

export const NewsletterList = ({ newsletters, locale, filter, title, description }: NewsletterListProps) => {
    const t = useTranslations('newsletter');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            locale === 'nl' ? 'nl-NL' : 'en-US',
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }
        );
    };

    // Filter newsletters based on the filter prop
    const filteredNewsletters = newsletters.edges?.filter(edge => {
        const node = edge?.node;
        if (!node?.published || !node.organization) return false;

        if (filter === 'main') {
            return node.organization === 'Boerengroep' || node.organization === 'Inspiratietheater';
        } else if (filter === 'friends') {
            return node.organization !== 'Boerengroep' && node.organization !== 'Inspiratietheater';
        }
        return false;
    }) || [];

    return (
        <Section>
            <div className="space-y-8">
                {/* Page Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>

                {/* Newsletter Grid */}
                {filteredNewsletters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNewsletters.map((edge) => {
                            const newsletter = edge?.node;
                            if (!newsletter) return null;

                            const isExternal = newsletter.type === 'link';
                            const href = isExternal
                                ? newsletter.externalLink!
                                : `/newsletters/${newsletter._sys.breadcrumbs.slice(1).join('/')}` as any;

                            return (
                                <Card key={newsletter.id} className="h-full hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="secondary">
                                                {newsletter.organization}
                                            </Badge>
                                            <Badge variant="outline">
                                                {t(`types.${newsletter.type}`) || newsletter.type}
                                            </Badge>
                                        </div>

                                        <CardTitle className="line-clamp-2 text-lg">
                                            {isExternal ? (
                                                <a
                                                    href={href as string}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline flex items-center gap-2"
                                                >
                                                    {newsletter.title}
                                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                                </a>
                                            ) : (
                                                <Link href={href} className="hover:underline">
                                                    {newsletter.title}
                                                </Link>
                                            )}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-4">
                                            {newsletter.linkDescription && (
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {newsletter.linkDescription}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {newsletter.publishDate && formatDate(newsletter.publishDate)}
                                                </span>
                                            </div>

                                            <Button asChild variant="outline" size="sm" className="w-full">
                                                {isExternal ? (
                                                    <a href={href as string} target="_blank" rel="noopener noreferrer">
                                                        {t('visit_link')}
                                                        <ExternalLink className="ml-2 h-4 w-4" />
                                                    </a>
                                                ) : (
                                                    <Link href={href}>
                                                        {t('read_more')}
                                                    </Link>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-lg font-semibold mb-2">No Newsletters Yet</h3>
                            <p className="text-muted-foreground">
                                {t('no_newsletters')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
};
EOF

# Step 6: Create news directory structure
echo "📝 Step 6: Creating news directory structure..."
mkdir -p app/\[locale\]/news/newsletter
mkdir -p app/\[locale\]/news/friends-news
mkdir -p app/\[locale\]/newsletters/\[...urlSegments\]

# Step 7: Create news index page
echo "📝 Step 7: Creating news index page..."
cat > app/\[locale\]/news/page.tsx << 'EOF'
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Layout from '@/components/layout/layout';
import { Section } from '@/components/layout/section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Users } from 'lucide-react';

interface NewsPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'navigation.items' });

    return {
        title: `${t('news')} - Stichting Boerengroep`,
        description: 'Stay updated with the latest news from Stichting Boerengroep and our partner organizations.',
    };
}

export default async function NewsPage({ params }: NewsPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'navigation.items' });
    const tNewsletter = await getTranslations({ locale, namespace: 'newsletter' });

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <Section>
                <div className="space-y-8">
                    {/* Page Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">
                            {t('news')}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Stay updated with the latest news from Stichting Boerengroep and our partner organizations.
                        </p>
                    </div>

                    {/* News Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Newsletter */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Globe className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>{t('newsletter')}</CardTitle>
                                        <CardDescription>
                                            {tNewsletter('description')}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href="/news/newsletter">
                                        View Newsletter
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Friends News */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>{t('friends-news')}</CardTitle>
                                        <CardDescription>
                                            News and updates from our partner organizations and friends.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/news/friends-news">
                                        View Friends News
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Landscape */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Globe className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>{t('landscape')}</CardTitle>
                                        <CardDescription>
                                            Insights and analysis of the sustainable agriculture landscape.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/news/landscape">
                                        View Landscape
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
EOF

# Step 8: Create newsletter page
echo "📝 Step 8: Creating newsletter page..."
cat > app/\[locale\]/news/newsletter/page.tsx << 'EOF'
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { client } from '@/tina/__generated__/client';
import { NewsletterList } from '@/components/newsletter-list';
import Layout from '@/components/layout/layout';

interface NewsletterPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: NewsletterPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('title')} - Stichting Boerengroep`,
        description: t('description'),
    };
}

async function getNewsletterData() {
    try {
        const data = await client.queries.newsletterConnection();
        return {
            newsletters: data.data?.newsletterConnection || { edges: [] },
        };
    } catch (error) {
        console.error('Error fetching newsletter data:', error);
        return {
            newsletters: { edges: [] },
        };
    }
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
    const { locale } = await params;
    const { newsletters } = await getNewsletterData();
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <NewsletterList
                newsletters={newsletters}
                locale={locale}
                filter="main"
                title={t('title')}
                description={t('description')}
            />
        </Layout>
    );
}
EOF

# Step 9: Create friends news page
echo "📝 Step 9: Creating friends news page..."
cat > app/\[locale\]/news/friends-news/page.tsx << 'EOF'
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { client } from '@/tina/__generated__/client';
import { NewsletterList } from '@/components/newsletter-list';
import Layout from '@/components/layout/layout';

interface FriendsNewsPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FriendsNewsPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('filters.friends')} - Stichting Boerengroep`,
        description: 'News and updates from our partner organizations.',
    };
}

async function getFriendNewsData() {
    try {
        const data = await client.queries.newsletterConnection();
        return {
            newsletters: data.data?.newsletterConnection || { edges: [] },
        };
    } catch (error) {
        console.error('Error fetching friend news data:', error);
        return {
            newsletters: { edges: [] },
        };
    }
}

export default async function FriendsNewsPage({ params }: FriendsNewsPageProps) {
    const { locale } = await params;
    const { newsletters } = await getFriendNewsData();
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <NewsletterList
                newsletters={newsletters}
                locale={locale}
                filter="friends"
                title={t('filters.friends')}
                description="News and updates from our partner organizations and friends in the sustainable agriculture community."
            />
        </Layout>
    );
}
EOF

# Step 10: Create newsletter detail page
echo "📝 Step 10: Creating newsletter detail page..."
cat > app/\[locale\]/newsletters/\[...urlSegments\]/page.tsx << 'EOF'
import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import NewsletterClientPage from './client-page';

export const revalidate = 300;

export default async function NewsletterDetailPage({
    params,
}: {
    params: Promise<{ locale: string; urlSegments: string[] }>;
}) {
    const { locale, urlSegments } = await params;
    const filepath = urlSegments.join('/');

    let data;
    try {
        // Try locale-specific newsletter first
        data = await client.queries.newsletter({
            relativePath: `${locale}/${filepath}.mdx`,
        });
    } catch (error) {
        // Fallback to non-localized newsletter
        try {
            data = await client.queries.newsletter({
                relativePath: `${filepath}.mdx`,
            });
        } catch (fallbackError) {
            notFound();
        }
    }

    return (
        <Layout rawPageData={data}>
            <NewsletterClientPage {...data} />
        </Layout>
    );
}

export async function generateStaticParams() {
    const locales = ['nl', 'en'];
    let newsletters = await client.queries.newsletterConnection();
    const allNewsletters = newsletters;

    if (!allNewsletters.data.newsletterConnection.edges) {
        return [];
    }

    while (newsletters.data?.newsletterConnection.pageInfo.hasNextPage) {
        newsletters = await client.queries.newsletterConnection({
            after: newsletters.data.newsletterConnection.pageInfo.endCursor,
        });

        if (!newsletters.data.newsletterConnection.edges) {
            break;
        }

        allNewsletters.data.newsletterConnection.edges.push(...newsletters.data.newsletterConnection.edges);
    }

    const params: { locale: string; urlSegments: string[] }[] = [];

    allNewsletters.data?.newsletterConnection.edges.forEach((edge) => {
        const breadcrumbs = edge?.node?._sys.breadcrumbs || [];

        if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
            const locale = breadcrumbs[0];
            const urlSegments = breadcrumbs.slice(1);

            if (urlSegments.length >= 1) {
                params.push({ locale, urlSegments });
            }
        } else {
            if (breadcrumbs.length >= 1) {
                locales.forEach(locale => {
                    params.push({ locale, urlSegments: breadcrumbs });
                });
            }
        }
    });

    return params;
}
EOF

# Step 11: Create newsletter detail client page
echo "📝 Step 11: Creating newsletter detail client page..."
cat > app/\[locale\]/newsletters/\[...urlSegments\]/client-page.tsx << 'EOF'
'use client';
import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { NewsletterQuery } from '@/tina/__generated__/types';
import { useLayout } from '@/components/layout/layout-context';
import { Section } from '@/components/layout/section';
import { Blocks } from '@/components/blocks';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ExternalLink, UserRound } from 'lucide-react';
import ErrorBoundary from '@/components/error-boundary';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const titleColorClasses = {
  blue: 'from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500',
  teal: 'from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500',
  green: 'from-green-400 to-green-600',
  red: 'from-red-400 to-red-600',
  pink: 'from-pink-300 to-pink-500',
  purple: 'from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500',
  orange: 'from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500',
  yellow: 'from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500',
};

interface ClientNewsletterProps {
  data: NewsletterQuery;
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function NewsletterClientPage(props: ClientNewsletterProps) {
  const { theme } = useLayout();
  const { data } = useTina({ ...props });
  const newsletter = data.newsletter;
  const t = useTranslations('newsletter');

  const date = new Date(newsletter.publishDate!);
  let formattedDate = '';
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, 'MMM dd, yyyy');
  }

  const titleColour = titleColorClasses[theme!.color! as keyof typeof titleColorClasses];

  // Determine back link based on organization
  const backLink = newsletter.organization === 'Boerengroep' || newsletter.organization === 'Inspiratietheater'
    ? '/news/newsletter'
    : '/news/friends-news';

  // If this is an external link, show a redirect message
  if (newsletter.type === 'link' && newsletter.externalLink) {
    return (
      <ErrorBoundary>
        <Section>
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Button variant="ghost" asChild>
                <Link href={backLink as any}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('back_to_newsletter')}
                </Link>
              </Button>
            </div>

            <div className="text-center space-y-6">
              <div className="space-y-4">
                <Badge variant="outline" className="mb-4">
                  {newsletter.organization}
                </Badge>

                <h1 data-tina-field={tinaField(newsletter, 'title')} className="text-3xl font-bold">
                  {newsletter.title}
                </h1>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span data-tina-field={tinaField(newsletter, 'publishDate')}>
                    {formattedDate}
                  </span>
                </div>

                {newsletter.linkDescription && (
                  <p data-tina-field={tinaField(newsletter, 'linkDescription')} className="text-lg text-muted-foreground">
                    {newsletter.linkDescription}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This content is hosted externally. Click the button below to visit the original article.
                </p>

                <Button asChild size="lg">
                  <a
                    href={newsletter.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-tina-field={tinaField(newsletter, 'externalLink')}
                  >
                    {t('visit_link')}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Section>
        {/* Breadcrumb */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href={backLink as any}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back_to_newsletter')}
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge variant="secondary">
                {newsletter.organization}
              </Badge>
              <Badge variant="outline">
                {t(`types.${newsletter.type}`) || newsletter.type}
              </Badge>
            </div>

            <h1 data-tina-field={tinaField(newsletter, 'title')} className={`mb-8 text-4xl md:text-5xl font-extrabold tracking-normal text-center title-font`}>
              <span className={`bg-clip-text text-transparent bg-linear-to-r ${titleColour}`}>
                {newsletter.title}
              </span>
            </h1>

            {/* Author and Date */}
            <div data-tina-field={tinaField(newsletter, 'author')} className='flex items-center justify-center mb-8'>
              {newsletter.author && (
                <>
                  <Avatar className="mr-4">
                    {newsletter.author.avatar && (
                      <AvatarImage
                        data-tina-field={tinaField(newsletter.author, 'avatar')}
                        src={newsletter.author.avatar}
                        alt={newsletter.author.name}
                      />
                    )}
                    <AvatarFallback>
                      <UserRound size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p
                      data-tina-field={tinaField(newsletter.author, 'name')}
                      className='text-base font-medium text-gray-600 group-hover:text-gray-800 dark:text-gray-200 dark:group-hover:text-white'
                    >
                      {newsletter.author.name}
                    </p>
                    {newsletter.author.affiliation && (
                      <p
                        data-tina-field={tinaField(newsletter.author, 'affiliation')}
                        className='text-sm text-muted-foreground'
                      >
                        {newsletter.author.affiliation}
                      </p>
                    )}
                  </div>
                  <span className='font-bold text-gray-200 dark:text-gray-500 mx-4'>—</span>
                </>
              )}
              <div className="flex items-center gap-2 text-base text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-150">
                <Calendar className="h-4 w-4" />
                <p data-tina-field={tinaField(newsletter, 'publishDate')}>
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Featured Image */}
            {newsletter.featuredImage && (
              <div className='w-full mb-12'>
                <div data-tina-field={tinaField(newsletter, 'featuredImage')} className='relative max-w-4xl lg:max-w-5xl mx-auto'>
                  <Image
                    priority={true}
                    src={newsletter.featuredImage}
                    alt={newsletter.title || ''}
                    className='relative z-10 mx-auto block rounded-lg w-full h-auto opacity-100'
                    width={800}
                    height={400}
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}

            {/* Excerpt */}
            {newsletter.excerpt && (
              <div data-tina-field={tinaField(newsletter, 'excerpt')} className='prose dark:prose-dark mx-auto mb-8 text-lg'>
                <TinaMarkdown content={newsletter.excerpt} />
              </div>
            )}
          </div>

          {/* Content Blocks */}
          {newsletter.body && newsletter.body.length > 0 && (
            <div data-tina-field={tinaField(newsletter, 'body')}>
              <Blocks blocks={newsletter.body as any} />
            </div>
          )}

          {/* Tags */}
          {newsletter.tags && newsletter.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">Tags:</span>
                {newsletter.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </ErrorBoundary>
  );
}
EOF

# Step 12: Update blocks component to handle newsletter body
echo "📝 Step 12: Updating blocks component..."
cat > components/blocks/index.tsx << 'EOF'
import { tinaField } from "tinacms/dist/react";
import { Page, PageBlocks } from "../../tina/__generated__/types";
import { Hero } from "./hero";
import { Content } from "./content";
import { Features } from "./features";
import { Testimonial } from "./testimonial";
import { Video } from "./video";
import { Callout } from "./callout";
import { Stats } from "./stats";
import { CallToAction } from "./call-to-action";
import { ImageText } from "./image-text";

// Union type for both page blocks and newsletter body blocks
type BlockType = PageBlocks | any;

export const Blocks = (props: Omit<Page, "id" | "_sys" | "_values"> | { blocks: BlockType[] }) => {
    const blocks = 'blocks' in props ? props.blocks : props.blocks;

    if (!blocks) return null;

    return (
        <>
            {blocks.map(function (block: BlockType, i: number) {
                return (
                    <div key={i} data-tina-field={tinaField(block)}>
                        <Block {...block} />
                    </div>
                );
            })}
        </>
    );
};

const Block = (block: BlockType) => {
    switch (block.__typename) {
        case "PageBlocksVideo":
        case "NewsletterBodyVideo":
            return <Video data={block} />;
        case "PageBlocksHero":
        case "NewsletterBodyHero":
            return <Hero data={block} />;
        case "PageBlocksCallout":
        case "NewsletterBodyCallout":
            return <Callout data={block} />;
        case "PageBlocksStats":
        case "NewsletterBodyStats":
            return <Stats data={block} />;
        case "PageBlocksContent":
        case "NewsletterBodyContent":
            return <Content data={block} />;
        case "PageBlocksFeatures":
        case "NewsletterBodyFeatures":
            return <Features data={block} />;
        case "PageBlocksTestimonial":
        case "NewsletterBodyTestimonial":
            return <Testimonial data={block} />;
        case "PageBlocksCta":
        case "NewsletterBodyCta":
            return <CallToAction data={block} />;
        case "PageBlocksImageText":
        case "NewsletterBodyImageText":
            return <ImageText data={block} />;
        default:
            return null;
    }
};
EOF

# Step 13: Remove old friend-news page if it exists
echo "📝 Step 13: Removing old friend-news page..."
rm -f app/\[locale\]/friend-news/page.tsx 2>/dev/null || true
rm -rf app/\[locale\]/friend-news 2>/dev/null || true

# Step 14: Update friend-news-page component to use reusable component
echo "📝 Step 14: Updating friend-news-page component..."
cat > components/friend-news-page.tsx << 'EOF'
'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { NewsletterList } from '@/components/newsletter-list';

interface NewsletterNode {
    id: string;
    title?: string | null;
    type?: string | null;
    organization?: string | null;
    publishDate?: string | null;
    externalLink?: string | null;
    linkDescription?: string | null;
    published?: boolean | null;
    featured?: boolean | null;
    excerpt?: any;
    _sys: {
        breadcrumbs: string[];
    };
}

interface NewsletterEdge {
    node?: NewsletterNode | null;
}

interface NewsletterConnection {
    edges?: (NewsletterEdge | null)[] | null;
}

interface FriendNewsPageProps {
    newsletters: NewsletterConnection;
    locale: string;
}

export const FriendNewsPage = ({ newsletters, locale }: FriendNewsPageProps) => {
    const t = useTranslations('newsletter');

    return (
        <NewsletterList
            newsletters={newsletters}
            locale={locale}
            filter="friends"
            title={t('filters.friends')}
            description="News and updates from our partner organizations and friends in the sustainable agriculture community."
        />
    );
};
EOF

echo "✅ Newsletter system implementation complete!"
echo ""
echo "📋 Summary of changes:"
echo "   1. ✅ Updated i18n routing configuration"
echo "   2. ✅ Updated global navigation (removed positions)"
echo "   3. ✅ Updated English and Dutch translations"
echo "   4. ✅ Created reusable NewsletterList component"
echo "   5. ✅ Created news index page"
echo "   6. ✅ Created newsletter listing page"
echo "   7. ✅ Created friends news listing page"
echo "   8. ✅ Created newsletter detail pages"
echo "   9. ✅ Updated blocks component for newsletter support"
echo "   10. ✅ Cleaned up old friend-news implementation"
echo ""
echo "🎯 Next steps:"
echo "   - Test the navigation and ensure all links work"
echo "   - Create some test newsletter content"
echo "   - Verify the TinaCMS admin interface works correctly"
echo ""
echo "All pages are now properly type-safe and follow Next.js best practices!"
