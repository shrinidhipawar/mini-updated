import Docker from "dockerode";
import getPort from "get-port";
import fs from "fs";
import path from "path";

const docker =
  process.platform === "win32"
    ? new Docker({ socketPath: "//./pipe/docker_engine" })
    : new Docker({ socketPath: "/var/run/docker.sock" });

// Subject → Docker Image Mapping
const subjectToImage: Record<string, string> = {
  "javascript": "codespace-javascript:latest",
  "java": "codespace-java:latest",
  "cpp": "codespace-cpp:latest",
  "python": "codespace-python:latest"
};

/**
 * Spins up a subject-specific container for a given user.
 */
export async function spinUpContainer(subject: string, userId: number) {
  const hostPort = await getPort();

  // Ensure subject is lowercase
  const normalizedSubject = subject.toLowerCase();
  console.log("Received subject:", subject);
  console.log("Normalized subject:", normalizedSubject);
  console.log("Available mappings:", Object.keys(subjectToImage));
  
  const image = subjectToImage[normalizedSubject];
  console.log("Mapped image:", image);
  
  if (!image) {
    console.error(`No Docker image found for subject: ${normalizedSubject}`);
    throw new Error(`No Docker image defined for subject: ${normalizedSubject}`);
  }

  const containerName = `codespace_${userId}_${Date.now()}`;
  console.log("Creating container:", containerName);

  try {
    // Check if image exists
    const images = await docker.listImages();
    const imageExists = images.some(img => img.RepoTags?.includes(image));
    console.log("Image exists:", imageExists);
    if (!imageExists) {
      throw new Error(`Docker image ${image} not found. Please build it first.`);
    }

    const container = await docker.createContainer({
      name: containerName,
      Image: image,
      Tty: true,
      ExposedPorts: { "8080/tcp": {} },
      Env: ["CS_DISABLE_IFRAME_PROTECTION=true"],
      Cmd: [
        "code-server",
        "--bind-addr", "0.0.0.0:8080",
        "--auth", "none"
      ],
      HostConfig: {
        PortBindings: {
          "8080/tcp": [{ HostPort: hostPort.toString() }]
        },
        AutoRemove: true
      }
    });

    console.log("Container created, starting...");
    await container.start();
    console.log("Container started successfully");

    const data = await container.inspect();
    const portInfo = data.NetworkSettings.Ports["8080/tcp"];
    const hostMappedPort = portInfo?.[0]?.HostPort;

    if (!hostMappedPort) {
      throw new Error("❌ Could not determine mapped host port for container");
    }

    const containerId = data.Id;
    const url = `http://localhost:${hostMappedPort}`;
    console.log("🚀 VS Code server running at:", url);

    const logs = await container.logs({ stdout: true, stderr: true });
    console.log("🪵 Container logs:\n", logs.toString());

    return { url, containerId };
  } catch (error) {
    console.error("Failed to create/start container:", error);
    throw error;
  }
}

/**
 * Stops and removes the container by ID.
 */
export async function stopContainer(containerId: string) {
  const container = docker.getContainer(containerId);
  try {
    await container.stop();
    console.log(`🛑 Stopped container: ${containerId}`);
  } catch (err) {
    console.error(`❌ Error stopping container:`, err);
  }
}

