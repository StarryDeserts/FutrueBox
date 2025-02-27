//查询所有nft
'use client'

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client'
import {boxid} from '../config/packid'

type CapsuleContent = {
  name: string;
  image_url: string;
  text_content: string;
  votes_num:string;
  owner_address:string;
  id:{id:string};
}

type Library = {
  fields: {
    value: {
      fields: CapsuleContent;
    }
  };
}

export async function fetchCapsuleData() {
  const client = new SuiClient({ url: getFullnodeUrl("testnet") });

  try {
    const objectListResponse = await client.getDynamicFields({
      parentId: boxid,
    });
    const objectIds = objectListResponse.data.map((item: { objectId: string }) => item.objectId);

    const detailsPromises = objectIds.map(async (objectId) => {
      const objectDetails = await client.getObject({
        id: objectId,
        options: {
          showContent: true,
        },
      });
      const content = objectDetails.data?.content as unknown as Library;
      return content.fields.value.fields;
    });

    const objectDetailsArray = await Promise.all(detailsPromises);
    return objectDetailsArray;
  } catch (error) {
    console.error('Error fetching dynamic fields or object details:', error);
    return [];
  }
}