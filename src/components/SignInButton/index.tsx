import styles from "./styles.module.scss";

import { signIn, useSession } from "next-auth/client";

import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";

export function SignInButton() {
  const [session] = useSession();

  return session ? (
    <button type="button" className={styles.signInButton}>
      <FaGithub color="#04d361" />
      {session.user.name}
      <FiX className={styles.closeIcon} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signIn("github")}
    >
      <FaGithub color="#eba417" />
      Sign In with GitHub
    </button>
  );
}
