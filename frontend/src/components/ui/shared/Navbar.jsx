import React from 'react';
import { Avatar, AvatarImage } from '../ui/avatar'; // Ensure this path is correct
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'; // Ensure this path is correct

const Navbar = () => {
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16">
        <div>
          <h1 className="text-2xl font-bold">
            Opportune<span className="text-[#F83002]">Bridge</span>
          </h1>
        </div>
        <div className="flex items-center gap-12">
          <ul className="flex font-medium items-center gap-5">
            <li>Home</li>
            <li>About</li>
            <li>Browse</li>
          </ul>
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              </Avatar>
            </PopoverTrigger>
            <PopoverContent>
              <h4>SimarSandhu</h4>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
