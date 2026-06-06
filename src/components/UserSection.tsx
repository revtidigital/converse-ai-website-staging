const brands = [
  "Xebia",
  "ICWF",
  "Gulmohar Lane",
  "BeWizor",
  "Sparked",
  "Affinity Travels",
  "SparkleBox",
  "Ultimate HR Solutions",
  "The Hunger Project",
  "CMR",
  "AAK",
  "IC Universal Legal",
];

const brandStyles = [
  "text-fuchsia-900",
  "text-slate-700",
  "text-stone-600",
  "text-orange-600",
  "text-cyan-600",
  "text-amber-700",
  "text-zinc-800",
  "text-sky-950",
  "text-indigo-900",
  "text-rose-800",
  "text-blue-700",
  "text-stone-700",
];

const UserSection = () => {
  const marqueeBrands = [...brands, ...brands];

  return (
    <section
      className="overflow-hidden bg-background py-16 md:py-20"
      aria-labelledby="brands-heading"
      title="Brands who trust ConverseAI"
    >
      <div className="container-tight">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Our customers
          </p>
          <h2 id="brands-heading" className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Brands Who Trust Us
          </h2>
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        aria-label="Sample customer brand logos moving from left to right"
      >
        <ul className="brands-marquee flex w-max items-center gap-6 md:gap-8" role="list">
          {marqueeBrands.map((brand, index) => (
            <li
              key={`${brand}-${index}`}
              className="flex h-24 w-56 shrink-0 items-center justify-center rounded-3xl border border-border/70 bg-white px-8 text-center shadow-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-soft md:h-28 md:w-64"
              aria-hidden={index >= brands.length}
            >
              <span className={`text-xl font-bold tracking-tight md:text-2xl ${brandStyles[index % brandStyles.length]}`}>
                {brand}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default UserSection;
