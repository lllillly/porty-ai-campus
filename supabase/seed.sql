insert into public.knowledge_documents (
    source_key,
    title,
    category,
    content,
    source_url,
    reference_date
)
values
    (
        'campus-address-gongju',
        '공주캠퍼스 주소',
        '캠퍼스',
        '공주캠퍼스 주소는 충청남도 공주시 공주대학로 56입니다.',
        'https://www.kongju.ac.kr/',
        '2025-06-01'
    ),
    (
        'campus-address-cheonan',
        '천안캠퍼스 주소',
        '캠퍼스',
        '천안캠퍼스 주소는 충청남도 천안시 서북구 천안대로 1223-24입니다.',
        'https://www.kongju.ac.kr/',
        '2025-06-01'
    ),
    (
        'campus-address-yesan',
        '예산캠퍼스 주소',
        '캠퍼스',
        '예산캠퍼스 주소는 충청남도 예산군 예산읍 대학로 54입니다.',
        'https://www.kongju.ac.kr/',
        '2025-06-01'
    )
on conflict (source_key) do update
set
    title = excluded.title,
    category = excluded.category,
    content = excluded.content,
    source_url = excluded.source_url,
    reference_date = excluded.reference_date;

