import { redirect } from "next/navigation";

interface FastAPIValidationError {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export const getErrorMessage = (error: unknown): string => {
  if (!error) return "Unknown error occurred";

  let message = "";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "object" && error !== null) {
    if ("detail" in error) {
      const detail = error.detail;
      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail
          .map((errItem: unknown) => {
            if (typeof errItem === "object" && errItem !== null) {
              const loc = "loc" in errItem ? errItem.loc : undefined;
              const msg = "msg" in errItem ? errItem.msg : undefined;
              const locPath = Array.isArray(loc) ? loc.slice(1).join(" -> ") : "Field";
              const errorMsg = typeof msg === "string" ? msg : "Invalid value";
              return `${locPath}: ${errorMsg}`;
            }
            return "Validation error";
          })
          .join("; ");
      }
    } else if ("message" in error && typeof error.message === "string") {
      message = error.message;
    }
  }

  if (!message) {
    try {
      message = JSON.stringify(error);
    } catch {
      message = "Unknown error occurred";
    }
  }

  // Next.js Redirect for expired/invalid JWT tokens (FastAPI 401 response)
  if (message.includes("Could not validate credentials")) {
    redirect("/login");
  }

  return message;
};
