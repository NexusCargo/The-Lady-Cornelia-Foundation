export const ICONS = {
  empower:'<circle cx="24" cy="15" r="7"/><path d="M10 42c0-9 6-15 14-15s14 6 14 15"/><path d="M24 27v6M21 30h6"/>',
  education:'<path d="M3 18 24 8l21 10-21 10z"/><path d="M12 23v10c0 3 5 6 12 6s12-3 12-6V23"/><path d="M45 18v12"/>',
  care:'<path d="M24 20c-3-6-12-4-12 3 0 6 12 12 12 12s12-6 12-12c0-7-9-9-12-3z"/><path d="M4 38h10l8 4h12l10-8"/>',
  community:'<circle cx="24" cy="14" r="5"/><circle cx="10" cy="20" r="4"/><circle cx="38" cy="20" r="4"/><path d="M14 40c0-7 4-12 10-12s10 5 10 12"/><path d="M2 36c0-5 3-8 8-8M46 36c0-5-3-8-8-8"/>',
  health:'<path d="M24 42S6 31 6 18a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 24-18 24z"/><path d="M24 17v12M18 23h12"/>',
  food:'<path d="M8 22h32a16 16 0 0 1-32 0z"/><path d="M14 14c0-3 3-3 3-6M22 14c0-3 3-3 3-6M30 14c0-3 3-3 3-6"/>',
  home:'<path d="M6 24 24 8l18 16"/><path d="M10 22v18h28V22"/><path d="M20 40V28h8v12"/>',
  heart:'<path d="M24 41S5 29 5 16a10 10 0 0 1 19-4 10 10 0 0 1 19 4c0 13-19 25-19 25z"/>'
};
export const DEFAULT_SETTINGS = {
  heroTitle: 'Empowering women, uplifting communities, building brighter futures.',
  heroLead: 'We support women, widows and the less privileged with care, education and opportunity, so every family has hope that lasts.',
  mission: 'To support, empower and create opportunities for women, widows and the less privileged in our communities.',
  vision: 'A society where every woman and family has access to support, hope and sustainable opportunities.',
  supportIntro: 'Four areas of work, one goal: women and families who can stand on their own.',
  programmesIntro: 'Health, dignity and a meal when it is needed most. These are some of the projects our volunteers have carried out in the community.',
  founderName: 'Cornelia Kafui Djordjormey',
  founderRole: 'Founder, The Lady Cornelia Foundation',
  founderBio: 'The Lady Cornelia Foundation, led by Cornelia Kafui Djordjormey, began with a simple belief: a community grows stronger when its women are supported. Cornelia leads that work from the front, standing with women, widows and families at every outreach.\n\nFrom free breast cancer screenings and sanitary pad donations to the Street Feeding Project and education support, every programme is built around listening first and then acting with care.',
  founderQuote: 'Together we can make a difference.',
  founderPhoto: 'assets/founder.jpg',
  tagline: 'Together we can make a difference.',
  email: '', phone: '', paystackKey: '',
  amounts: '50,100,200,500,1000',
  bankDetails: '',
  facebook: '', instagram: '', tiktok: '', x: '',
  galleryIntro: 'Behind every outreach are people who chose to show up. These photographs follow our volunteers from busy streets to the riverbank, and the women and families we serve along the way.',
  nextOn: false, nextTitle: '', nextDate: '', nextTime: '', nextPlace: '', nextText: '', nextImage: '', nextCta: '', nextLink: '',
  slideSeconds: 5.5
};
export const DEFAULT_SLIDES = [
  {caption:'Sanitary pad donations', image:'assets/pads-community.jpg', alt:'Volunteers and women of the community holding up packs of sanitary pads', pos:'50% 40%', order:1, published:true},
  {caption:'Street Feeding Project', image:'assets/street-feeding.jpg', alt:'Volunteers and community members at the Street Feeding Project', pos:'50% 45%', order:2, published:true},
  {caption:'Free breast cancer screening', image:'assets/screening-banner.jpg', alt:'The founder with a volunteer in front of the breast cancer awareness banner', pos:'50% 50%', order:3, published:true},
  {caption:'Free health checks', image:'assets/bp-check.jpg', alt:'Volunteer in a white coat taking a woman’s blood pressure', pos:'50% 50%', order:4, published:true},
  {caption:'Community awareness', image:'assets/awareness-session.jpg', alt:'The founder speaking with a young woman at a community awareness session', pos:'66% 50%', order:5, published:true},
  {caption:'Our volunteers', image:'assets/outreach-blazer.jpg', alt:'The founder with a volunteer usher at an outreach event', pos:'50% 30%', order:6, published:true}
];
export const DEFAULT_PILLARS = [
  {title:'Women empowerment', text:'Skills, mentorship and opportunities that help women lead.', icon:'empower', order:1, published:true},
  {title:'Education support', text:'Helping children and young women stay in school and learn.', icon:'education', order:2, published:true},
  {title:'Widows and orphans care', text:'Practical help and dignity for those who have lost a provider.', icon:'care', order:3, published:true},
  {title:'Community development', text:'Health outreach, hygiene support and street feeding that lift whole neighbourhoods.', icon:'community', order:4, published:true}
];
export const DEFAULT_PROGRAMMES = [
  {title:'Breast cancer awareness and free screening', body:'Each year our volunteers set up in the open air, check blood pressure, talk through early detection and offer screening at no cost. Early awareness saves lives.', gallery:[{url:'assets/bp-check.jpg',caption:'Free health checks',pos:'50% 50%'},{url:'assets/awareness-talk.jpg',caption:'Awareness talks',pos:'50% 50%'}], order:1, published:true},
  {title:'Lady Cornelia Donates Sanitary Pads', body:'Our volunteers bring sanitary pads straight to girls and women in the community, because dignity during her period should never depend on what a family can afford.', gallery:[{url:'assets/pads-volunteers.jpg',caption:'Our volunteers',pos:'50% 30%'},{url:'assets/pads-community.jpg',caption:'Pads shared with the community',pos:'50% 40%'}], order:2, published:true},
  {title:'Street Feeding Project', body:'Under the banner Love for the Street, our volunteers go out to people living on the streets and serve them a meal with a kind word. It is our way of serving humanity, one plate at a time.', gallery:[{url:'assets/street-feeding.jpg',caption:'Street Feeding Project',pos:'50% 45%'}], order:3, published:true}
];
export const DEFAULT_GALLERY = [
  {title:'Showing up, speaking up', body:'Our work begins in the open: a conversation about early detection, a meal served on the street, a smile that tells someone they are seen. Hope, Fight, Cure is more than words on a shirt. It is how we show up.', gallery:[
    {url:'assets/gallery-hope-fight-cure.jpg',caption:'Speaking up for early detection',note:'Early detection saves lives. Every conversation helps a woman get checked sooner.',alt:'A volunteer in a Hope Fight Cure breast cancer awareness T-shirt speaking into a microphone',pos:'50% 50%'},
    {url:'assets/gallery-community-gathering.jpg',caption:'A community comes together',note:'Neighbours gather together, and every one of them matters.',alt:'Women and girls in colourful dresses gathered along a roadside under the trees',pos:'50% 60%'},
    {url:'assets/gallery-street-feeding-frame.jpg',caption:'Smiles at the Street Feeding Project',note:'Love for the Street: serving humanity, one plate at a time.',alt:'A volunteer in a yellow Street Feeding Project T-shirt smiling through an Instagram-style photo frame',pos:'50% 45%'}
  ], order:1, published:true},
  {title:'Where the road ends, we keep going', body:'Some of the families who need us most live beyond the end of the road. So our volunteers put on life jackets, board the canoes and cross the water, carrying supplies for the people waiting on the other side.', gallery:[
    {url:'assets/gallery-life-jackets.jpg',caption:'Life jackets on, ready to go',note:'Safety first. Everyone is kitted out before the crossing.',alt:'Volunteers in orange life jackets gathered by the river bank',pos:'50% 35%'},
    {url:'assets/gallery-river-landing.jpg',caption:'At the landing, before the crossing',note:'Last smiles on dry land before the boats set off.',alt:'Four smiling volunteers at the river landing, two wearing orange life jackets',pos:'50% 35%'},
    {url:'assets/gallery-boarding-canoes.jpg',caption:'Boarding the canoes',note:'Team and supplies loaded, one canoe at a time.',alt:'Volunteers in life jackets boarding long wooden canoes at the river bank',pos:'50% 50%'},
    {url:'assets/gallery-river-crossing.jpg',caption:'Crossing the river',note:'A long way over open water for the families on the far side.',alt:'A small wooden canoe carrying volunteers across a wide river lined with green forest',pos:'50% 62%'},
    {url:'assets/gallery-carrying-supplies.jpg',caption:'Carrying supplies to the community',note:'Hand to hand, pack by pack.',alt:'Volunteers carrying packs of sanitary pads and household supplies under a large tree',pos:'50% 50%'},
    {url:'assets/gallery-together.jpg',caption:'Together with the community',note:'The reason we cross: people waiting to be seen and supported.',alt:'Volunteers and community members standing together in front of the Street Feeding Project banner',pos:'50% 40%'}
  ], order:2, published:true}
];
