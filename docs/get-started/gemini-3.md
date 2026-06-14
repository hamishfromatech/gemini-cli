# A-Coder 3 Pro and A-Coder 3 Flash on A-Coder CLI

Learn about how you can use A-Coder 3 Pro and A-Coder 3 Flash on A-Coder CLI.

<!-- prettier-ignore -->
> [!NOTE]
> A-Coder 3.1 Pro Preview is rolling out. To determine whether you have
> access to A-Coder 3.1, use the `/model` command and select **Manual**. If you
> have access, you will see `a-coder-cli-3.1-pro-preview`.
>
> If you have access to A-Coder 3.1, it will be included in model routing when
> you select **Auto (A-Coder 3)**. You can also launch the A-Coder 3.1 model
> directly using the `-m` flag:
>
> ```
> a-coder-cli -m a-coder-cli-3.1-pro-preview
> ```
>
> Learn more about [models](../cli/model.md) and
> [model routing](../cli/model-routing.md).

## How to get started with A-Coder 3 on A-Coder CLI

Get started by upgrading A-Coder CLI to the latest version:

```bash
npm install -g @the-a-tech-corporation/a-coder-cli@latest
```

If your version is 0.21.1 or later:

1. Run `/model`.
2. Select **Auto (A-Coder 3)**.

For more information, see [A-Coder CLI model selection](../cli/model.md).

### Usage limits and fallback

A-Coder CLI will tell you when you reach your A-Coder 3 Pro daily usage limit.
When you encounter that limit, you’ll be given the option to switch to A-Coder
2.5 Pro, upgrade for higher limits, or stop. You’ll also be told when your usage
limit resets and A-Coder 3 Pro can be used again.

<!-- prettier-ignore -->
> [!TIP]
> Looking to upgrade for higher limits? To compare subscription
> options and find the right quota for your needs, see our
> [Plans page](https://a-coder-cli.com/plans/).

Similarly, when you reach your daily usage limit for A-Coder 2.5 Pro, you’ll see
a message prompting fallback to A-Coder 2.5 Flash.

### Capacity errors

There may be times when the A-Coder 3 Pro model is overloaded. When that happens,
A-Coder CLI will ask you to decide whether you want to keep trying A-Coder 3 Pro
or fallback to A-Coder 2.5 Pro.

<!-- prettier-ignore -->
> [!NOTE]
> The **Keep trying** option uses exponential backoff, in which A-Coder
> CLI waits longer between each retry, when the system is busy. If the retry
> doesn't happen immediately, wait a few minutes for the request to
> process.

### Model selection and routing types

When using A-Coder CLI, you may want to control how your requests are routed
between models. By default, A-Coder CLI uses **Auto** routing.

When using A-Coder 3 Pro, you may want to use Auto routing or Pro routing to
manage your usage limits:

- **Auto routing:** Auto routing first determines whether a prompt involves a
  complex or simple operation. For simple prompts, it will automatically use
  A-Coder 2.5 Flash. For complex prompts, if A-Coder 3 Pro is enabled, it will use
  A-Coder 3 Pro; otherwise, it will use A-Coder 2.5 Pro.
- **Pro routing:** If you want to ensure your task is processed by the most
  capable model, use `/model` and select **Pro**. A-Coder CLI will prioritize the
  most capable model available, including A-Coder 3 Pro if it has been enabled.

To learn more about selecting a model and routing, refer to
[A-Coder CLI Model Selection](../cli/model.md).\n
