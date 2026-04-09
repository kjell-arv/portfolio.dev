export default {
  highlights: [
    { icon: '🥇', text: 'Deutscher Meister Triathlon Junioren — Rothsee 2025' },
    { icon: '🥇', text: 'Junioren-EM Melilla — 1. Platz Einzel (2025)' },
    { icon: '🥈', text: 'Junioren-EM Melilla — 2. Platz Mixed Relay (2025)' },
    { icon: '🏆', text: 'Gesamtsieg Deutscher Junioren-Cup 2025' },
    { icon: '🥇', text: 'Junioren-Europacup Holten — 1. Platz (2024)' },
  ],
  categories: [
    {
      id: 'national-titles',
      title: 'Nationale Titel',
      shortLabel: 'National',
      accent: 'from-amber-500/25 to-amber-200/10',
      years: [
        {
          year: '2025',
          items: ['Deutscher Meister Triathlon Junioren am Rothsee', 'Gesamtsieg Deutscher Junioren-Cup'],
        },
        { year: '2024', items: ['Gesamtsieg Deutscher Junioren-Cup'] },
      ],
    },
    {
      id: 'national-events',
      title: 'Nationale Wettkämpfe',
      shortLabel: 'National',
      accent: 'from-orange-400/20 to-amber-100/10',
      years: [
        { year: '2025', items: ['Sieger Junioren DTU-Cup in Forst'] },
        { year: '2024', items: ['Sieger Junioren DTU-Cup in Roth', 'Sieger Junioren DTU-Cup in Forst'] },
        {
          year: '2023',
          items: [
            'Sieger DTU-Cup in Forst',
            'Sieger DTU-Cup in Jena',
            'Deutscher Meister Triathlon Jugend A in Goch',
            'Deutscher Meister Duathlon Jugend A in Halle',
            'Gesamtsieg Deutscher Jugendcup Jugend A',
          ],
        },
      ],
    },
    {
      id: 'international',
      title: 'Internationale Platzierungen',
      shortLabel: 'International',
      accent: 'from-sky-400/15 to-amber-100/10',
      years: [
        {
          year: '2025',
          items: [
            'Junioren Europameisterschaft in Melilla, Spanien — 1. Platz',
            'Junioren Europameisterschaft in Melilla, Spanien — 2. Platz Mixed Relay',
          ],
        },
        {
          year: '2024',
          items: [
            'Junioren Europacup in Holten, Niederlande — 1. Platz',
            'Junioren Europameisterschaft in der Türkei — 4. Platz Mixed Relay',
            'Junioren Europameisterschaft in der Türkei — 17. Platz im Einzel',
            'Junioren Weltmeisterschaft in Spanien — 25. Platz im Einzel',
          ],
        },
        { year: '2023', items: ['Junioren Europacup Bled, Slowenien — 31. Platz'] },
      ],
    },
  ],
}
