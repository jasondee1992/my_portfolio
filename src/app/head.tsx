export default function Head() {
  const iconHref = "/images/profile/profile.jpeg?v=2";

  return (
    <>
      <link rel="icon" href={iconHref} sizes="any" />
      <link rel="shortcut icon" href={iconHref} />
      <link rel="apple-touch-icon" href={iconHref} />
    </>
  );
}
