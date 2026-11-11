// ============================================================
// HOME PAGE PHOTOS
// Copies of photos from The Saturdays gallery, bundled with the
// site so the homepage never depends on what's in the gallery.
// To change one: drop a new .jpg in src/assets/saturdays/ and
// point the import below at it.
// ============================================================
import raking from '../assets/saturdays/raking.jpg';
import youngVolunteer from '../assets/saturdays/young-volunteer.jpg';
import smilingVolunteer from '../assets/saturdays/smiling-volunteer.jpg';
import pruning from '../assets/saturdays/pruning.jpg';
import gatheringLeaves from '../assets/saturdays/gathering-leaves.jpg';
import teamPraying from '../assets/saturdays/team-praying.jpg';

// The strip under "Real hands. Real porches." — shape and offset are
// purely visual (aspect ratio, how far down the photo sits, focal point).
export const saturdayStrip = [
  { src: raking, alt: 'A volunteer in a Church in the City shirt raking a yard.', ar: '4/5', off: 0, pos: '66% 50%', speed: -0.05 },
  { src: youngVolunteer, alt: 'A young volunteer holding a rake taller than he is.', ar: '1/1', off: 56, pos: '72% 50%', speed: 0.06 },
  { src: smilingVolunteer, alt: 'A volunteer smiling at the camera on a work day.', ar: '4/5', off: 12, pos: '42% 40%', speed: -0.08 },
  { src: pruning, alt: 'A volunteer pruning bougainvillea beside a house.', ar: '1/1', off: 72, pos: '48% 50%', speed: 0.05 },
  { src: gatheringLeaves, alt: 'A volunteer gathering a pile of leaves and branches.', ar: '4/5', off: 24, pos: '24% 50%', speed: -0.04 },
];

// Behind the "From an event to a culture" panel.
export const visionPhoto = teamPraying;
