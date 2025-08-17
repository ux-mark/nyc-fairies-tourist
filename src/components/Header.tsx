
"use client";
import React from "react";

export default function Header() {
	return (
		<header role="banner" className="w-full py-6 px-4 bg-primary text-primary-foreground shadow-md flex items-center sticky top-0 z-20">
			<div className="flex items-center gap-2">
				<span className="inline-block w-6 h-6 rounded-full bg-accent" aria-hidden="true" />
				<h1 className="text-xl font-bold tracking-tight">NYC with The Fairies</h1>
			</div>
		</header>
	);
}
