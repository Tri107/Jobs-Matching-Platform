import {
  authBrandCopy,
  authStats,
} from "@/features/auth/constants/authContent";

export function AuthBrandPanel() {
  return (
    <section className="relative hidden w-[47%] overflow-hidden bg-[linear-gradient(180deg,#3973ff_0%,#2858df_100%)] px-10 py-14 text-white lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.28),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.1),_transparent_28%)]" />
      <div className="relative z-10 max-w-sm">
        <p className="text-[2rem] font-extrabold tracking-[-0.03em]">
          {authBrandCopy.title}
        </p>
        <p className="mt-4 text-sm leading-6 text-blue-100">
          {authBrandCopy.description}
        </p>
      </div>

      <div className="relative z-10 mt-12 overflow-hidden rounded-[18px] border border-white/12 bg-[#0f245f]/55 p-5 shadow-[0_18px_44px_rgba(6,18,55,0.4)] backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_center,_rgba(55,202,255,0.38),_transparent_70%)]" />
        <div className="relative h-[300px] rounded-[14px] border border-cyan-400/10 bg-[linear-gradient(160deg,#102154_5%,#0b1c48_42%,#14396f_100%)] p-4">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(89,211,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(89,211,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute left-8 top-8 h-20 w-20 rounded-full border border-cyan-300/40 shadow-[0_0_40px_rgba(53,223,255,0.4)]" />
          <div className="absolute left-16 top-16 h-36 w-36 rounded-full border border-cyan-300/20" />
          <div className="absolute right-8 top-10 flex gap-2">
            <span className="h-14 w-8 rounded-full bg-cyan-300/15" />
            <span className="h-20 w-8 rounded-full bg-cyan-300/20" />
            <span className="h-12 w-8 rounded-full bg-cyan-300/25" />
          </div>
          <div className="absolute bottom-0 left-1/2 h-[255px] w-[160px] -translate-x-1/2 rounded-t-[80px] bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))]" />
          <div className="absolute bottom-16 left-1/2 h-[110px] w-[110px] -translate-x-1/2 rounded-full border border-cyan-100/40 bg-[radial-gradient(circle,_rgba(102,231,255,0.45),_rgba(31,70,154,0.06)_60%,_transparent_72%)] shadow-[0_0_50px_rgba(82,244,255,0.35)]" />
        </div>
      </div>

      <div className="relative z-10 mt-auto grid grid-cols-3 gap-6 pt-10">
        {authStats.map((stat) => (
          <div key={stat.label}>
            <p className="text-[1.75rem] font-extrabold tracking-[-0.03em]">
              {stat.value}
            </p>
            <p className="text-sm text-blue-100">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
