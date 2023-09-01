import Link from "next/link";

import { Icons } from "@/components/icons";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { openSourceFriends } from "@/config/oss-friends";

const OpenSourceFriends = () => {
  return (
    <MarketingLayout>
      <h1 className="text-foreground font-cal mb-5 text-4xl">
        Our OpenSource Friends
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {openSourceFriends.map((friend) => (
          <Card key={friend.name} className="group">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={friend.logo} alt={friend.name} />
                  <AvatarFallback>{friend.name}</AvatarFallback>
                </Avatar>
                <CardTitle>
                  <Link
                    href={friend.website}
                    target="_blank"
                    className="relative cursor-pointer duration-200 after:absolute after:bottom-0 after:left-0 after:h-1 after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full group-hover:underline"
                  >
                    {friend.name}
                  </Link>
                </CardTitle>
              </div>
              <CardDescription>{friend.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="flex items-center gap-2.5">
                <Link href={friend.website} target="_blank">
                  <Icons.globe className="text-muted-foreground h-5 w-5 hover:text-black" />
                </Link>
                {Object.entries(friend.socialLinks).map(([key, value]) => {
                  if (value) {
                    const Icon = Icons[value.icon];
                    return (
                      <Link href={value.link} target="_blank" key={key}>
                        <Icon className="text-muted-foreground h-5 w-5 hover:text-black" />
                      </Link>
                    );
                  }
                })}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </MarketingLayout>
  );
};

export default OpenSourceFriends;
