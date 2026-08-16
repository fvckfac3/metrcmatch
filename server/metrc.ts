import axios from "axios";
import type { MetrcConnection } from "../drizzle/schema";
import { decryptSecret } from "./security";

type MetrcPackage = {
  Id?: number | string;
  Label?: string;
  Item?: { Name?: string; ProductCategoryName?: string; StrainName?: string };
  ItemName?: string;
  ProductName?: string;
  Quantity?: number | string;
  UnitOfMeasureName?: string;
  LabTestingState?: string;
  LastModified?: string;
};

function connectionClient(connection: MetrcConnection) {
  const integratorKey = decryptSecret(connection.encryptedIntegratorApiKey);
  const userKey = decryptSecret(connection.encryptedUserApiKey);
  if (!integratorKey || !userKey) throw new Error("Both the Metrc integrator API key and user API key are required before connecting.");
  return axios.create({
    baseURL: connection.apiBaseUrl,
    timeout: 25_000,
    auth: { username: integratorKey, password: userKey },
    headers: { Accept: "application/json" },
  });
}

function licenseNumber(connection: MetrcConnection) {
  if (!connection.licenseNumber) throw new Error("An Oregon Metrc license number is required before syncing.");
  return connection.licenseNumber;
}

export async function testMetrcConnection(connection: MetrcConnection) {
  const client = connectionClient(connection);
  await client.get("/packages/v2/active", { params: { licenseNumber: licenseNumber(connection), pageSize: 1 } });
  return true;
}

export async function fetchMetrcInventory(connection: MetrcConnection, lastSyncedAt: Date | null) {
  const client = connectionClient(connection);
  const response = await client.get<MetrcPackage[]>("/packages/v2/active", {
    params: {
      licenseNumber: licenseNumber(connection),
      ...(lastSyncedAt ? { lastModifiedStart: new Date(lastSyncedAt.getTime() - 5 * 60_000).toISOString() } : {}),
    },
  });
  return response.data.map(item => ({
    metrcPackageId: String(item.Id ?? item.Label ?? ""),
    packageLabel: item.Label ?? null,
    productName: item.Item?.Name ?? item.ItemName ?? item.ProductName ?? "Unnamed Metrc package",
    sku: item.Item?.ProductCategoryName ?? item.Item?.StrainName ?? null,
    quantity: Number(item.Quantity ?? 0),
    unitOfMeasure: item.UnitOfMeasureName ?? "units",
    testingStatus: item.LabTestingState ?? "Unknown",
    sourceLastModifiedAt: item.LastModified ? new Date(item.LastModified) : null,
  })).filter(item => item.metrcPackageId.length > 0 && Number.isFinite(item.quantity));
}

export async function fetchMetrcSalesCount(connection: MetrcConnection) {
  const client = connectionClient(connection);
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  try {
    const response = await client.get<unknown[]>("/sales/v2/receipts", {
      params: {
        licenseNumber: licenseNumber(connection),
        salesDateStart: twoDaysAgo.toISOString().slice(0, 10),
        salesDateEnd: now.toISOString().slice(0, 10),
      },
    });
    return Array.isArray(response.data) ? response.data.length : 0;
  } catch {
    return 0;
  }
}
