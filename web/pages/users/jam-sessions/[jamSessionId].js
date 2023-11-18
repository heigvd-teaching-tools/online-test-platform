import { useRouter } from "next/router";

// This is a temporary redirect to the new path
// TODO: remove in february 2024

const LegacyRedirect = () => {
    const router = useRouter();
    const { jamSessionId } = router.query;
    router.push(`/users/evaluations/${jamSessionId}`);
}

export default LegacyRedirect;