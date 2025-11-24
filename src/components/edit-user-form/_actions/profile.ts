"use server";
import { Pages, Routes } from "@/constants/enums";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { db } from "@/lib/prisma";
import getTrans from "@/lib/translation";
import { updateProfileSchema } from "@/validations/profile";
import { UserRole } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

type PutBlobResult = { url: string };

export const updateProfile = async (
  isAdmin: boolean,
  prevState: unknown,
  formData: FormData
) => {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);
  const result = updateProfileSchema(translations).safeParse(
    Object.fromEntries(formData.entries())
  );

  if (result.success === false) {
    const flattened = result.error.flatten();
    return {
      error: flattened.fieldErrors,
      formData,
    };
  }
  const data = result.data;
  const imageFile = data.image as File;
  const imageUrl = Boolean(imageFile.size)
    ? await getImageUrl(imageFile)
    : undefined;

  try {
    const user = await db.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (!user) {
      return {
        message: translations.messages.userNotFound,
        status: 401,
        formData,
      };
    }
    await db.user.update({
      where: {
        email: user.email,
      },
      data: {
        ...data,
        image: imageUrl ?? user.image,
        role: isAdmin ? UserRole.ADMIN : UserRole.USER,
      },
    });
    revalidatePath(`/${locale}/${Routes.PROFILE}`);
    revalidatePath(`/${locale}/${Routes.ADMIN}`);
    revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.USERS}`);
    revalidatePath(
      `/${locale}/${Routes.ADMIN}/${Pages.USERS}/${user.id}/${Pages.EDIT}`
    );
    return {
      status: 200,
      message: translations.messages.updateProfileSucess,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: translations.messages.unexpectedError,
    };
  }
};

const getImageUrl = async (imageFile: File) => {
  // const formData = new FormData();
  // formData.append("file", imageFile);
  // formData.append("pathName", "profile_images");

  // try {
  //   const response = await fetch(
  //     `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
  //     {
  //       method: "POST",
  //       body: formData,
  //     }
  //   );
  //   const image = (await response.json()) as { url: string };
  //   return image.url;
  // } catch (error) {
  //   console.error("Error uploading file to Cloudinary:", error);
  // }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const uploadUrl = `${base.replace(
    /\/$/,
    ""
  )}/api/upload?filename=${encodeURIComponent(imageFile.name)}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: imageFile,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => null);
    console.error("Upload failed", response.status, text);
    throw new Error("Image upload failed");
  }

  const newBlob = (await response.json()) as PutBlobResult;
  return newBlob.url;
};
