import os

from torch import nn, tanh
import torch.onnx


class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()

        self.fc1 = nn.Linear(10, 5)
        self.fc2 = nn.Linear(5, 3)
        self.fc3 = nn.Linear(3, 2)

        self.softsign = nn.Softsign()

    def forward(self, x):
        x = tanh(self.fc1(x))
        x = self.softsign(self.fc2(x))
        return self.fc3(x)


torch_model = SimpleNet()

x = torch.randn(100, 10)
torch_out = torch_model(x)

torch.onnx.export(
    torch_model,  # model being run
    x,  # model input (or a tuple for multiple inputs)
    f"{os.path.dirname(__file__)}/test_pytorch.onnx",
    export_params=True,  # store the trained parameter weights inside the model file
    opset_version=10,  # the ONNX version to export the model to
    do_constant_folding=True,  # whether to execute constant folding for optimization
    input_names=["input"],  # the model's input names
    output_names=["output"],  # the model's output names
    dynamic_axes={
        "input": {0: "batch_size"},  # variable length axes
        "output": {0: "batch_size"},
    },
    dynamo=False,
)
