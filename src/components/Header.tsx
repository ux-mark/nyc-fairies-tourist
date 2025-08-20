
"use client";
import React, { useState } from "react";
import { useAuth } from "../lib/auth-context";
import AuthModal from "./AuthModal";

export default function Header() {
	const { user, loading, signOut } = useAuth();
	const [showAuthModal, setShowAuthModal] = useState(false);

	return (
		<header role="banner" className="w-full py-6 px-4 bg-primary text-primary-foreground shadow-md flex items-center sticky top-0 z-20">
			<div className="flex items-center gap-2 flex-1">
				<span className="inline-block w-6 h-6 rounded-full bg-accent" aria-hidden="true" />
				<h1 className="text-xl font-bold tracking-tight">NYC with The Fairies</h1>
			</div>
			<div className="flex items-center gap-3 ml-auto">
				{loading ? null : user ? (
					<>
						<span className="text-sm font-medium bg-muted text-muted-foreground px-3 py-1 rounded">
							{user.email}
						</span>
						<button
							className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
							onClick={signOut}
						>
							Logout
						</button>
					</>
				) : (
					<button
						className="px-3 py-1 rounded bg-primary-foreground text-primary text-sm hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
						onClick={() => setShowAuthModal(true)}
					>
						Login
					</button>
				)}
			</div>
			<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={() => setShowAuthModal(false)} />
		</header>
	);
}
