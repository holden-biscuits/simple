import Image from "next/image";

const mascots = {
  guides: {
    src: "/ranger-guides-map.webp",
    alt: "The TeamSimple ranger raccoon thoughtfully reading a trail map",
  },
  ae: {
    src: "/ranger-ae-spyglass.webp",
    alt: "The TeamSimple ranger raccoon looking through a spyglass",
  },
  sdr: {
    src: "/ranger-sdr-listening.webp",
    alt: "The TeamSimple ranger raccoon listening closely with a paw to his ear",
  },
  leadership: {
    src: "/ranger-leadership-rock.webp",
    alt: "The TeamSimple ranger raccoon pointing ahead with one boot on a rock",
  },
  marketing: {
    src: "/ranger-marketing-books.webp",
    alt: "The TeamSimple ranger raccoon peeking out from a giant pile of event books and papers",
  },
} as const;

export type PageMascotVariant = keyof typeof mascots;

export function PageMascot({ variant }: { variant: PageMascotVariant }) {
  const mascot = mascots[variant];
  return (
    <figure className={`page-mascot page-mascot-${variant}`}>
      <Image src={mascot.src} width={1122} height={1402} alt={mascot.alt} unoptimized />
      <span className="page-mascot-logo" aria-hidden="true">
        <Image src="/simple-mark.svg" width={19} height={24} alt="" />
      </span>
    </figure>
  );
}
