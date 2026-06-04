#!/usr/bin/env python3
"""CLI script to create the first admin user.

Usage:
    python scripts/create_admin.py
    python scripts/create_admin.py --email admin@meinhelfer.de --name "Max Mustermann"
"""

import argparse
import asyncio
import sys
from pathlib import Path

# Allow running from repo root
sys.path.insert(0, str(Path(__file__).parent.parent))


async def main(email: str, full_name: str, password: str) -> None:
    from app.core.database import AsyncSessionLocal
    from app.core.security import get_password_hash
    from app.models.admin import Admin
    from app.repositories.admin_repository import AdminRepository

    async with AsyncSessionLocal() as session:
        repo = AdminRepository(session)

        if await repo.email_exists(email):
            print(f"Admin with email '{email}' already exists.")
            sys.exit(1)

        admin = Admin(
            email=email.lower(),
            hashed_password=get_password_hash(password),
            full_name=full_name,
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)

    print(f"Admin created successfully!")
    print(f"  ID:    {admin.id}")
    print(f"  Email: {admin.email}")
    print(f"  Name:  {admin.full_name}")


if __name__ == "__main__":
    import getpass

    parser = argparse.ArgumentParser(description="Create a MeinHelfer admin user")
    parser.add_argument("--email", default="admin@meinhelfer.de")
    parser.add_argument("--name", default="Admin")
    args = parser.parse_args()

    password = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm password: ")

    if password != confirm:
        print("Passwords do not match.")
        sys.exit(1)

    if len(password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)

    asyncio.run(main(email=args.email, full_name=args.name, password=password))
