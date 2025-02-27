import Link from 'next/link';
import { ConnectButton} from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";

export function Navbar() {
  return (
          <nav className="flex items-center bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 h-20 z-50 w-full border-b backdrop-blur">
            <div className="container flex h-14 items-center">
              {/* 左侧的 FutureBox 和导航链接 */}
              <div className="flex items-center space-x-6">
                <Link href="/" className="mr-12 flex items-center space-x-3 pl-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary"
                  >
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"
                      fill="currentColor"
                    />
                    <path
                      d="M9 21v-1h6v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1z"
                      fill="currentColor"
                      fillOpacity="0.5"
                    />
                  </svg>
                  <span className="font-bold text-lg">FutureBox</span>
                </Link>
                {/* 这里是靠左的链接部分 */}
                <div className="flex space-x-12 text-base font-medium">
                  <Link href="/eum">NFT内容</Link>
                  <Link href="/nft">我的NFT</Link>
                </div>
              </div>
              
              {/* 右侧的链接和按钮 */}
              <div className="flex flex-1 items-center justify-end space-x-6">
                <ConnectButton />
              </div>
            </div>
          </nav>
  );
}

