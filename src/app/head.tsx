export default function Head() {
  const faviconHref = "/favicon.ico?v=2";
  const appleIconHref = "/apple-icon.png?v=2";

  return (
    <>
      <link rel="icon" href={faviconHref} sizes="any" />
      <link rel="shortcut icon" href={faviconHref} />
      <link rel="apple-touch-icon" href={appleIconHref} />
    </>
  );
}
