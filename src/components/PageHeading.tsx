export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-widest text-smile-dark">{eyebrow}</p>
      ) : null}
      <h1
        className={
          eyebrow
            ? 'mt-2 font-heading text-3xl font-bold tracking-tight text-squid sm:text-4xl'
            : 'font-heading text-2xl font-bold tracking-tight text-squid sm:text-3xl'
        }
      >
        {title}
      </h1>
      {description ? <p className="mt-2 max-w-2xl text-squid/70">{description}</p> : null}
    </div>
  )
}
