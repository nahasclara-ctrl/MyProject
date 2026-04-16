import { bottombarLinks } from "@/constants";
import { Link, useLocation } from "react-router-dom";

const P = {
  50: "#f6fbf8",
  100: "#eaf5ef",
  200: "#d6ebe0",
  300: "#b7dcc8",
  400: "#7bbf9a",
  500: "#4f9f75",
  600: "#3f8a63",
  700: "#2f6e4f",
};

const Bottombar = () => {
  const { pathname } = useLocation();

  return (
    <section className="bottombar">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;

        return (
          <Link
            to={link.route}
            key={link.label}
            className="flex-center flex-col gap-1 p-2 transition rounded-[10px]"
            style={{
              backgroundColor: isActive ? P[500] : "transparent",
            }}
          >
            <img
              src={link.imgURL}
              alt={link.label}
              width={16}
              height={16}
              style={{
                filter: isActive
                  ? "brightness(0) invert(1)"
                  : "grayscale(100%) opacity(0.6)",
              }}
            />

            <p
              className="tiny-medium"
              style={{
                color: isActive ? "#ffffff" : P[400],
              }}
            >
              {link.label}
            </p>
          </Link>
        );
      })}
    </section>
  );
};

export default Bottombar;