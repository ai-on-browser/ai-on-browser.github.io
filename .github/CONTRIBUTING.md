# Contributing

Thank you for your interest in contributing to this project. This repository is an educational library intended to help people learn how machine learning algorithms work internally. Because of this goal, the project follows a somewhat different policy from typical open source projects. Please read the following before contributing.

## Issues

Issues are accepted only for the following:

- Bug reports
- Requests to implement a new model
- Requests/feedback regarding existing models

### Welcome

- Requests for models other than neural networks are very welcome.

### May not be accommodated

- Deep learning models, especially recent large-scale generative AI models, may not be feasible to support due to memory and execution speed constraints in the browser.
- The implementations in this project are not intended to be efficient; instead, they aim to faithfully reproduce the algorithms as presented in papers, etc. For this reason, requests for major improvements that would obscure the original algorithm (e.g., introducing k-d trees for nearest-neighbor search) generally cannot be accommodated.

### Required information

- **Bug reports** must include concrete, step-by-step instructions to reproduce the issue. Reports without reproduction steps may be closed.
- **Requests to implement a new model** must include a reference to the original paper the model is based on, a link to a publicly available reference implementation, or a link to a site that introduces/explains the model. Whenever possible, please provide a primary source (the original paper or a reference implementation) rather than a secondary source. Requests without any such reference may be closed.

Issues that do not fall into the categories above (questions, general discussion, unrelated requests, etc.), or that omit the required information above, may be closed as out of scope. Thank you for your understanding.

## Pull Requests

Because the developer's goal is to understand each algorithm by implementing it personally, Pull Requests are generally not accepted. This applies both to the library code and to the GUI/demo code.

The only exception is:

- Cases involving a high security risk that require urgent action.

If your Pull Request falls under this exception, please follow this process:

1. Open an Issue first, describing the security risk.
2. Create your branch from that Issue, named `feature/<issue no>` (use this `feature/` naming even for security fixes).
3. Before submitting the Pull Request, confirm that all three of the following test commands pass:
   - `npm run test:lib` (run `npm run create-onnx` first, before this command)
   - `npm run test:gui`
   - `npm run test:js`

Pull Requests that do not meet the exception above, or that do not follow this process, may be closed regardless of their content. If you would like to request a new model or feature, please open an Issue instead of submitting a Pull Request.

## Summary

| Type | Policy |
| --- | --- |
| Bug report (Issue) | Accepted (must include reproduction steps) |
| Request to implement a model (Issue) | Accepted (must include a paper, implementation, or introductory site; primary sources preferred; models other than neural networks especially welcome) |
| Request regarding an existing model (Issue) | Accepted (may not always be accommodated, depending on content) |
| Request to implement large-scale generative AI models | May not be accommodated |
| Improvement requests that would obscure the original algorithm | May not be accommodated |
| Pull Request | Generally not accepted (except urgent security fixes, and only via Issue → `feature/<issue no>` branch → passing all three test commands) |

Thank you for your cooperation.