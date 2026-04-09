export default {
  highlights: [
    { icon: '🥇', text: 'German junior triathlon champion — Rothsee 2025' },
    { icon: '🥇', text: 'Junior European Championships Melilla — 1st individual (2025)' },
    { icon: '🥈', text: 'Junior European Championships Melilla — 2nd mixed relay (2025)' },
    { icon: '🏆', text: 'Overall winner German Junior Cup 2025' },
    { icon: '🥇', text: 'Junior European Cup Holten — 1st place (2024)' },
  ],
  categories: [
    {
      id: 'national-titles',
      title: 'National titles',
      shortLabel: 'National',
      accent: 'from-amber-500/25 to-amber-200/10',
      years: [
        {
          year: '2025',
          items: ['German junior triathlon champion at Rothsee', 'Overall winner German Junior Cup'],
        },
        { year: '2024', items: ['Overall winner German Junior Cup'] },
      ],
    },
    {
      id: 'national-events',
      title: 'National events',
      shortLabel: 'National',
      accent: 'from-orange-400/20 to-amber-100/10',
      years: [
        { year: '2025', items: ['Winner junior DTU Cup in Forst'] },
        { year: '2024', items: ['Winner junior DTU Cup in Roth', 'Winner junior DTU Cup in Forst'] },
        {
          year: '2023',
          items: [
            'Winner DTU Cup in Forst',
            'Winner DTU Cup in Jena',
            'German youth A triathlon champion in Goch',
            'German youth A duathlon champion in Halle',
            'Overall winner German youth cup (youth A)',
          ],
        },
      ],
    },
    {
      id: 'international',
      title: 'International results',
      shortLabel: 'International',
      accent: 'from-sky-400/15 to-amber-100/10',
      years: [
        {
          year: '2025',
          items: [
            'Junior European Championships Melilla, Spain — 1st place',
            'Junior European Championships Melilla, Spain — 2nd place mixed relay',
          ],
        },
        {
          year: '2024',
          items: [
            'Junior European Cup Holten, Netherlands — 1st place',
            'Junior European Championships Turkey — 4th place mixed relay',
            'Junior European Championships Turkey — 17th place individual',
            'Junior World Championships Spain — 25th place individual',
          ],
        },
        { year: '2023', items: ['Junior European Cup Bled, Slovenia — 31st place'] },
      ],
    },
  ],
}
