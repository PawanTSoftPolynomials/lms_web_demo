import type {NextConfig} from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "miro.medium.com",
            },
            {
                protocol: "https",
                hostname: "www.devprojournal.com",
            },
            {
                protocol: "https",
                hostname: "encrypted-tbn0.gstatic.com",
            },
            {
                protocol: "https",
                hostname: "wildlearner.com",
            },
            {
                protocol: "https",
                hostname: "www.cnet.com",
            },
        ],
    },
};

module.exports = nextConfig;
export default nextConfig;
 