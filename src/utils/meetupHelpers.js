export const MIN_MEETUP_IMAGES = 3;
export const MAX_MEETUP_IMAGES = 4;

export const getMeetupCoverUrl = (meetup) => {
  const images = meetup?.images || [];
  const main = images.find((img) => img.isMain) || images[0];
  return main?.url || meetup?.bannerImage?.url || null;
};

export const getMeetupStatusLabel = (meetup) => {
  if (meetup.status === 'pending_approval') return 'Pending Approval';
  if (meetup.status === 'published' && meetup.isAdminApproved) return 'Live';
  if (meetup.status === 'published' && !meetup.isAdminApproved) return 'Pending Approval';
  return meetup.status?.replace('_', ' ') || 'draft';
};

export const canSubmitMeetup = (meetup) =>
  (meetup?.images?.length || 0) >= MIN_MEETUP_IMAGES;
