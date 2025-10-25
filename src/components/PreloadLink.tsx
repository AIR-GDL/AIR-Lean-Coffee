export default function PreloadLink() {
  return (
    <>
      <link rel="preload" href="/animations/loading.json" as="fetch" crossOrigin="anonymous" />
    </>
  );
}
