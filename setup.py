from setuptools import setup, find_packages

setup(
    name='ai-policy-docs',
    version='1.0.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'requests',
        'federal_register',
        'python-dateutil',
        'psycopg2',
        'tqdm',
        'anthropic'
    ],
    entry_points={
        'console_scripts': [
            'pull_fr_documents = scripts.pull_fr_documents:main',
            'summarize_fr_documents = scripts.summarize_fr_documents:main',
        ],
    },
)