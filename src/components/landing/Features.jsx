import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  MessageSquareCode,
  CalendarDays,
  Zap,
  ArrowRight,
} from "lucide-react";
import useScrollReveal from "../../utils/useScrollReveal";

const features = [
  {
    icon: ShieldCheck,
    title: "Physical Auditing & Badges",
    description:
      "Every listed PG is physically inspected by our verification team. We verify cleanliness, safety standards, WiFi availability, meal quality, and essential amenities before assigning an official verification badge.",
    color:
      "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border border-blue-200",
    hover: "group-hover:text-blue-600",
  },
  {
    icon: MessageSquareCode,
    title: "Direct Owner Interaction",
    description:
      "Communicate directly with verified owners through real-time chat. Negotiate rent, discuss facilities, clarify terms, and finalize agreements without brokers or unnecessary commissions.",
    color:
      "bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-600 border border-cyan-200",
    hover: "group-hover:text-cyan-600",
  },
  {
    icon: CalendarDays,
    title: "Community Meetup System",
    description:
      "Attend owner-hosted community meetups before booking your accommodation. Meet fellow tenants, explore the environment, and build confidence before making your decision.",
    color:
      "bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 border border-violet-200",
    hover: "group-hover:text-violet-600",
  },
  {
    icon: Zap,
    title: "Instant Lead Notifications",
    description:
      "Owners receive instant dashboard alerts and email notifications whenever prospective tenants enquire, schedule visits, or express interest in their property.",
    color:
      "bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 border border-amber-200",
    hover: "group-hover:text-amber-600",
  },
];

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color,
  hover,
  index,
  isRevealed,
}) => {
  return (
    <div
      className={`
        group
        relative
        flex
        flex-col
        h-full
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-8
        lg:p-10
        shadow-sm
        transition-all
        duration-500
        hover:-translate-y-3
        hover:border-blue-200
        hover:shadow-[0_30px_70px_rgba(15,23,42,0.12)]
        ${
          isRevealed
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-12"
        }
      `}
      style={{
        transitionDelay: `${index * 120}ms`,
      }}
    >
      {/* Animated Gradient Border */}

      <div className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-orange-500 transition-transform duration-500 group-hover:scale-x-100" />

      {/* Background Glow */}

      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-100 opacity-0 blur-3xl transition duration-700 group-hover:opacity-40" />

      {/* Icon */}

      <div
        className={`
          relative
          z-10
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          ${color}
          transition-all
          duration-500
          group-hover:scale-110
          group-hover:rotate-3
        `}
      >
        <Icon size={30} strokeWidth={1.8} />
      </div>

      {/* Title */}

      <h3 className="relative z-10 mt-8 text-2xl font-bold leading-tight text-slate-900">
        {title}
      </h3>

      {/* Description */}

      <p className="relative z-10 mt-5 flex-grow text-[17px] leading-8 text-slate-600">
        {description}
      </p>

      {/* Divider */}

      <div className="relative z-10 my-8 h-px bg-slate-200" />

      {/* Footer */}

      <div
        className={`
          relative
          z-10
          inline-flex
          items-center
          gap-2
          font-semibold
          text-slate-500
          transition-all
          duration-300
          ${hover}
        `}
      >
        <span>Learn more</span>

        <ArrowRight
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-2"
        />
      </div>
    </div>
  );
};

export default function Features() {
  const [revealRef, isRevealed] = useScrollReveal({
    threshold: 0.15,
  });

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-slate-50 py-24 lg:py-32"
    >
      {/* Background Decoration */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-cyan-100/30 blur-3xl" />

        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-100/30 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f020_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f020_1px,transparent_1px)] bg-[size:70px_70px]" />

      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">

        {/* ================= Header ================= */}

        <div
          ref={revealRef}
          className={`mx-auto max-w-4xl text-center transition-all duration-700 ${
            isRevealed
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-700 shadow-sm">
            Platform Capabilities
          </span>

          <h2 className="mt-8 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            High-Performance Features
            <br />
            Built for Direct Deals
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-slate-600 lg:text-xl">
            Discover verified PGs, connect directly with trusted owners,
            participate in community meetups, and manage your accommodation
            journey through a modern platform designed for transparency,
            trust, and speed.
          </p>
        </div>

        {/* ================= Cards ================= */}

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">

          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
              index={index}
              isRevealed={isRevealed}
            />
          ))}

        </div>

        {/* ================= CTA ================= */}

        <div
          className={`mt-20 flex justify-center transition-all duration-700 delay-500 ${
            isRevealed
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <Link
            to="/features"
            className="
              group
              inline-flex
              items-center
              gap-3
              rounded-2xl
              bg-gradient-to-r
              from-blue-600
              to-indigo-600
              px-8
              py-4
              text-base
              font-semibold
              text-white
              shadow-lg
              shadow-blue-500/20
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-2xl
              hover:shadow-blue-500/30
            "
          >
            View All Platform Features

            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

      </div>
    </section>
  );
}