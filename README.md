# align-params

Align Params is a Visual Studio Code extension that automatically aligns multi-line function call parameters in C++ for consistent and readable formatting across different environments.

## Features

- Aligns multi-line function call parameters
- Uses spaces instead of tabs for consistent formatting
- Automatically runs on file save
- Provides a manual command for alignment
- Handles nested expressions (e.g. static_cast)
- Preserves:
  - Comments
  - Function definitions
  - Control statements (if, for, while)

## Example

Before:

```cpp
logAtLevels(LogLevel::ERROR,
        API_ID,
      value,
          FAILED_MSG,
            {LEVEL_3});

After:

logAtLevels(LogLevel::ERROR,
            API_ID,
            value,
            FAILED_MSG,
            {LEVEL_3});

Usage
The extension works automatically when saving a file.
Press:
Ctrl + S

For manual alignment:
Ctrl + Alt + L

Or use the command palette:
Align Parameters

Requirements
No dependencies required.
To prevent conflicts with other formatters such as clang-format, it is recommended to disable:
JSON"editor.formatOnSave": falseShow more lines
Extension Settings
This extension currently does not add custom VS Code settings.
Supported Languages

C++
C (limited support)

Known Issues

Extremely complex macro-based code may not be fully supported
Designed for standard multi-line function call patterns

Release Notes
0.0.2
Initial release with:

Multi-line parameter alignment
Auto alignment on save
Manual command support

Contact
For questions or feedback:
Email: seldaturgut2020@gmail.com
GitHub: https://github.com/seldatrgt35/align-params
Following Extension Guidelines
This extension follows the official VS Code extension development guidelines:
https://code.visualstudio.com/api/references/extension-guidelines#