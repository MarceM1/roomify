import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";
import { PUTER_WORKER_URL } from "./constants";

export const signIn = async () => await puter.auth.signIn();
export const signOut = async () => await puter.auth.signOut();
export const getCurrentUser = async () => {
    try {
      return  await puter.auth.getUser()
    } catch (error) {
        console.log('Error getting user: ', error);
        return null;
    }
};

export const createProject = async ({item, visibility = 'private'}: CreateProjectParams) : Promise<DesignItem | null | undefined> =>{

    if(!PUTER_WORKER_URL) {
        console.warn('Missing PUTER_WORKER_URL, cannot save project.');
        return null;
    }

    // console.log('Creating project with item:', item, 'and visibility:', visibility);

    const projectId = item.id;

    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId 
        ? await uploadImageToHosting({
            hosting,
            url:item.sourceImage,
            projectId,
            label: 'source'
        }) 
        : null
    ;
    // console.log('Hosted source result:', hostedSource);

    // console.log('item.renderedImage before hosting:', item.renderedImage);
    // console.log('isHostedUrl(item.renderedImage):', item.renderedImage ? isHostedUrl(item.renderedImage) : 'No rendered image');

    
    const hostedRender  = projectId && item.renderedImage 
        ? await uploadImageToHosting({
            hosting,
            url:item.renderedImage,
            projectId,
            label: 'rendered'
        }) 
        : null
    ;
    // console.log('Hosted render result:', hostedRender);

    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage) 
        ? item.sourceImage 
        : ''
    );

    // console.log('Resolved source URL:', resolvedSource);

    if (!resolvedSource){
        console.warn('Failed to host source image, skipping save.')
        return null;
    };

    const resolvedRender = hostedRender?.url 
        ? hostedRender?.url
        : item.renderedImage && isHostedUrl(item.renderedImage)
            ? item.renderedImage
            : undefined
    ;

    // console.log('Resolved render URL:', resolvedRender);

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item;
    
    // console.log('Project item before save:', item);

    const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender
    };
    // console.log('Payload to save:', payload);

    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project: payload, visibility })
        });

        if (!response.ok) {
            console.error('Failed to save project', await response.text());
            return null;
        }

        const data = (await response.json()) as { project?: DesignItem | null };

        return data?.project ?? null;
    } catch (e) {
        console.log('Failed to save project: ', e);
        return null;
    }

};

export const getProjects = async () => {
    if(!PUTER_WORKER_URL) {
        console.warn('Missing PUTER_WORKER_URL, cannot fetch projects.');
        return [];
    }

    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/list`, { method: 'GET' });

        if (!response.ok) {
            console.error('Failed to fetch projects', await response.text());
            return [];
        }

        const data = (await response.json()) as { projects?: DesignItem[] | null };
        // console.log('Data fetched from getProjects:', data);

        return Array.isArray(data?.projects) ? data?.projects : [];

    } catch (error) {
        console.warn('Failed to fetch projects: ', error);
        return [];
    }
};

export const getProjectById = async ({ id }: { id: string }) => {
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    console.log("Fetching project with ID:", id);

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        // console.log("Fetch project response:", response);

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};

