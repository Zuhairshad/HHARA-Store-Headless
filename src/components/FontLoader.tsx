"use client";

export function FontLoader() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Aguafina+Script&family=Alex+Brush&family=Allura&family=Arizonia&family=Caveat:wght@400;600;700&family=Great+Vibes&family=Herr+Von+Muellerhoff&family=Italianno&family=Kaushan+Script&family=Monsieur+La+Doulaise&family=MonteCarlo&family=Mrs+Saint+Delafield&family=Parisienne&family=Pinyon+Script&family=Qwigley&family=Ruthie&family=Stalemate&display=swap"
        media="print"
        onLoad={(e) => { (e.target as HTMLLinkElement).media = "all"; }}
      />
    </>
  );
}
