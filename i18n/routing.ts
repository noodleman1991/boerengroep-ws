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

        // Jobs
        '/jobs': {
            en: '/jobs',
            nl: '/vacatures'
        },
        '/jobs/internships': {
            en: '/jobs/internships',
            nl: '/vacatures/stages'
        },
        '/jobs/coordinator': {
            en: '/jobs/coordinator',
            nl: '/vacatures/coordinator'
        },
        '/jobs/freelance': {
            en: '/jobs/freelance',
            nl: '/vacatures/freelance'
        },
        '/jobs/volunteers': {
            en: '/jobs/volunteers',
            nl: '/vacatures/vrijwilligers'
        },

        // News
        '/news': {
            en: '/news',
            nl: '/nieuws'
        },
        '/news/positions': {
            en: '/news/positions',
            nl: '/nieuws/standpunten'
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
    JOBS: '/jobs',
    NEWS: '/news',
    INSPIRATION_THEATER: '/inspiration-theater',
    LIBRARY: '/library',
    CONTACT: '/contact'
} as const;
