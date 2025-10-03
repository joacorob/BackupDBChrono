<p align="center">
    <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" align="center" width="30%">
</p>
<p align="center"><h1 align="center">BACKUPDBCHRONO</h1></p>
<p align="center">
		<em><code>Effortless, automated, and periodic database backups with S3 storage & Telegram notifications.</code></em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/joacorob/BackupDBChrono?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/joacorob/BackupDBChrono?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/joacorob/BackupDBChrono?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/joacorob/BackupDBChrono?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="center"><!-- default option, no dependency badges. -->
</p>
<p align="center">
	<!-- default option, no dependency badges. -->
</p>
<br>

## Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Project Structure](#-project-structure)
  - [ Project Index](#-project-index)
- [ Getting Started](#-getting-started)
  - [ Prerequisites](#-prerequisites)
  - [ Installation](#-installation)
  - [ Usage](#-usage)
  - [ Testing](#-testing)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)

---

## Overview

**BackupDBChrono** is a Node.js-based tool designed to:

- Connect to multiple databases (MySQL, MongoDB, SQLite, etc.) using environment variables.
- Automatically run backups every 4 hours using `node-cron`.
- Compress and store the last 30 versions of each database backup (5 days of history).
- Push each backup to an S3 bucket.
- Send a Telegram notification once the backup is complete.
- Clean up local backups after successful uploads.

This solution is ideal for developers, sysadmins, or anyone needing a simple, automated, and versioned database backup process.

---

## Features

- **Multiple Database Support:** Easily add new databases by specifying their connection URLs in an environment variable.
- **Automatic Scheduling:** Uses `node-cron` to run backups every 4 hours by default.
- **Versioned Backups:** Retains the last 30 backups for each database (5 days of history), ensuring historical redundancy.
- **S3 Integration:** Seamlessly uploads compressed backups to an Amazon S3 bucket.
- **Telegram Notifications:** Sends a message to a specified Telegram chat upon backup completion.
- **Agnostic Configuration:** Define databases and credentials without modifying code—just adjust environment variables.

---

## Project Structure

```sh
└── BackupDBChrono/
    ├── backups
    │   └── .keep
    ├── package.json
    └── src
        ├── config
        │   └── databases.js
        ├── index.js
        ├── services
        │   ├── backup.js
        │   ├── mongodb-backup.js
        │   ├── mysql-backup.js
        │   ├── s3.js
        │   ├── sqlite-backup.js
        │   └── telegram.js
        └── utils
            ├── compression.js
            └── naming.js
```

### Project Index

<details open> <summary><b><code>BACKUPDBCHRONO/</code></b></summary> <details> <summary><b>__root__</b></summary> <blockquote> <table> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/package.json'>package.json</a></b></td> <td>Project dependencies and scripts.</td> </tr> </table> </blockquote> </details> <details> <summary><b>backups</b></summary> <blockquote> <table> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/backups/.keep'>.keep</a></b></td> <td>Placeholder directory to store local backups temporarily.</td> </tr> </table> </blockquote> </details> <details> <summary><b>src</b></summary> <blockquote> <table> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/src/index.js'>index.js</a></b></td> <td>Main entry point. Sets up cron jobs and triggers backup processes.</td> </tr> </table> <details> <summary><b>config</b></summary> <blockquote> <table> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/src/config/databases.js'>databases.js</a></b></td> <td>Parses the <code>DB</code> environment variable to load database connection URLs.</td> </tr> </table> </blockquote> </details> <details> <summary><b>utils</b></summary> <blockquote> <table> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/src/utils/compression.js'>compression.js</a></b></td> <td>Handles the compression of backup files before uploading to S3.</td> </tr> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/src/utils/naming.js'>naming.js</a></b></td> <td>Generates timestamped, consistent backup filenames.</td> </tr> </table> </blockquote> </details> <details> <summary><b>services</b></summary> <blockquote> <table> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/src/services/telegram.js'>telegram.js</a></b></td> <td>Sends Telegram messages upon backup completion.</td> </tr> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/src/services/mysql-backup.js'>mysql-backup.js</a></b></td> <td>Creates backups for MySQL databases using provided connection URLs.</td> </tr> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/src/services/sqlite-backup.js'>sqlite-backup.js</a></b></td> <td>Backs up SQLite databases from local file paths.</td> </tr> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/src/services/backup.js'>backup.js</a></b></td> <td>Main backup orchestration: runs backups, retains versions, initiates uploads.</td> </tr> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/src/services/s3.js'>s3.js</a></b></td> <td>Handles uploading backups to AWS S3 using environment variables.</td> </tr> <tr> <td><b><a href='https://github.com/joacorob/BackupDBChrono/blob/master/src/services/mongodb-backup.js'>mongodb-backup.js</a></b></td> <td>Generates backups for MongoDB databases.</td> </tr> </table> </blockquote> </details> </blockquote> </details> </details>

---

## Getting Started

### Prerequisites

Before getting started with BackupDBChrono, ensure your runtime environment meets the following requirements:

- **Programming Language:** JavaScript
- **Package Manager:** Npm

### Installation

Install BackupDBChrono using one of the following methods:

**Build from source:**

1. Clone the BackupDBChrono repository:

```sh
❯ git clone https://github.com/joacorob/BackupDBChrono
```

2. Navigate to the project directory:

```sh
❯ cd BackupDBChrono
```

3. Install the project dependencies:

**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm install
```

### Usage

Run BackupDBChrono using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm start
```

### Testing

Run the test suite using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm test
```

---

## Project Roadmap

- [x] **`Task 1`**: <strike>Implement feature one.</strike>
- [ ] **`Task 2`**: Add more DB Engines

---

## Contributing

- **💬 [Join the Discussions](https://github.com/joacorob/BackupDBChrono/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/joacorob/BackupDBChrono/issues)**: Submit bugs found or log feature requests for the `BackupDBChrono` project.
- **💡 [Submit Pull Requests](https://github.com/joacorob/BackupDBChrono/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/joacorob/BackupDBChrono
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/joacorob/BackupDBChrono/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=joacorob/BackupDBChrono">
   </a>
</p>
</details>
