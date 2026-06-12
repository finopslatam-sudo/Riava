import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException
from app.models.company import Company


def _slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s-]+", "-", slug)
    return slug[:100]


async def create_company(db: AsyncSession, name: str) -> Company:
    base_slug = _slugify(name)
    slug = base_slug
    counter = 1

    while True:
        existing = await db.execute(select(Company).where(Company.slug == slug))
        if not existing.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    company = Company(name=name, slug=slug)
    db.add(company)
    await db.flush()
    return company


async def get_company_by_id(db: AsyncSession, company_id: uuid.UUID) -> Company | None:
    result = await db.execute(select(Company).where(Company.id == company_id))
    return result.scalar_one_or_none()
