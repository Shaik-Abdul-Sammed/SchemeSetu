import torch
import torch.nn as nn

class ResidualVectorQuantizer(nn.Module):
    def __init__(self, num_quantizers=4, codebook_size=256, dim=64):
        super().__init__()
        self.num_quantizers = num_quantizers
        self.codebooks = nn.ModuleList([nn.Embedding(codebook_size, dim) for _ in range(num_quantizers)])

    def forward(self, x):
        residual = x
        quantized_out = 0
        indices = []
        for codebook in self.codebooks:
            # Find nearest codebook vector
            dist = torch.cdist(residual.unsqueeze(1), codebook.weight.unsqueeze(0))
            idx = torch.argmin(dist, dim=-1).squeeze(-1)
            quantized = codebook(idx)
            residual = residual - quantized
            quantized_out = quantized_out + quantized
            indices.append(idx)
        return quantized_out, indices

class RQVAE(nn.Module):
    def __init__(self, input_dim=32, latent_dim=64):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, latent_dim)
        )
        self.rvq = ResidualVectorQuantizer(num_quantizers=4, codebook_size=256, dim=latent_dim)
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 128),
            nn.ReLU(),
            nn.Linear(128, input_dim)
        )

    def forward(self, x):
        z = self.encoder(x)
        z_q, indices = self.rvq(z)
        x_recon = self.decoder(z_q)
        return x_recon, indices

if __name__ == "__main__":
    model = RQVAE()
    sample_input = torch.randn(2, 32)
    recon, codes = model(sample_input)
    print("RQ-VAE Recon Shape:", recon.shape, "Code Layers:", len(codes))
