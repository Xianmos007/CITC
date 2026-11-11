// ============================================================
// PHOTOS ON THE INNER PAGES
// Copies of Saturdays gallery photos, bundled with the site.
// Each page header shows three, overlapping. `pos` is the focal
// point if a photo is cropped (x% y%).
// ============================================================
import teamPraying from '../assets/saturdays/team-praying.jpg';
import smilingVolunteer from '../assets/saturdays/smiling-volunteer.jpg';
import mailboxVolunteer from '../assets/saturdays/mailbox-volunteer.jpg';
import loadingTrailer from '../assets/saturdays/loading-trailer.jpg';
import pruning from '../assets/saturdays/pruning.jpg';
import gatheringLeaves from '../assets/saturdays/gathering-leaves.jpg';
import raking from '../assets/saturdays/raking.jpg';
import youngVolunteer from '../assets/saturdays/young-volunteer.jpg';
import clearingBrush from '../assets/saturdays/clearing-brush.jpg';
import hero1600 from '../assets/hero/hero-1600.webp';

export const pagePhotos = {
  who: [
    { src: teamPraying, alt: 'Volunteers from several churches standing in a circle, praying before a Saturday of serving.', pos: '50% 60%' },
    { src: smilingVolunteer, alt: 'A volunteer in a Church in the City shirt smiling on a work day.', pos: '42% 35%' },
    { src: mailboxVolunteer, alt: 'A volunteer in work gloves taking a break by a row of mailboxes.', pos: '45% 40%' },
  ],
  partners: [
    { src: loadingTrailer, alt: 'Volunteers loading yard tools onto a trailer outside a home.', pos: '50% 55%' },
    { src: pruning, alt: 'A volunteer pruning bougainvillea beside a house.', pos: '48% 45%' },
    { src: gatheringLeaves, alt: 'A volunteer gathering a pile of leaves and branches.', pos: '24% 50%' },
  ],
  volunteer: [
    { src: raking, alt: 'A volunteer raking a yard.', pos: '62% 40%' },
    { src: youngVolunteer, alt: 'A young volunteer holding a rake taller than he is.', pos: '72% 50%' },
    { src: clearingBrush, alt: 'A volunteer clearing overgrown brush along a white fence.', pos: '45% 50%' },
  ],
};

// The wide photo partway down "Who we are".
export const whoBand = {
  src: hero1600,
  alt: 'A smiling boy in a Church in the City T-shirt and work gloves holds a rake while clearing brush in an overgrown lot.',
  caption: 'A Saturday on the north side of Titusville.',
};
