import Image from "next/image";
import Logo from "../../../../public/assets/images/bsoft-logo.webp";

export default function BsoftLoader() {
  return (
    <div className="loaderRoot" role="status" aria-label="Loading">
      <div className="logoWrap">
        <Image
          src={Logo}
          alt="Brand logo"
          fill
          sizes="128px"
          priority
          className="logoImg"
        />
        <div className="sheen" />
      </div>
    </div>
  );
}
