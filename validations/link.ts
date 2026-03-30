import * as v from "valibot";

const SlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CreateLinkSchema = v.object({
  title: v.pipe(
    v.string("Title is required"),
    v.minLength(1, "Title is required"),
    v.maxLength(100, "Title cannot exceed 100 characters")
  ),
  description: v.optional(
    v.pipe(v.string(), v.maxLength(300, "Description cannot exceed 300 characters"))
  ),
  slug: v.pipe(
    v.string("Slug is required"),
    v.minLength(1, "Slug is required"),
    v.maxLength(80, "Slug cannot exceed 80 characters"),
    v.regex(SlugPattern, "Slug must be lowercase letters, numbers, and hyphens only")
  ),
  targetUrl: v.pipe(
    v.string("Target URL is required"),
    v.minLength(1, "Target URL is required"),
    v.url("Please enter a valid URL")
  ),
  imageUrl: v.optional(v.nullable(v.pipe(v.string(), v.url("Please enter a valid image URL")))),
  isProtected: v.boolean(),
  password: v.optional(v.string()),
  isActive: v.boolean(),
  sortOrder: v.pipe(
    v.number("Sort order must be a number"),
    v.integer("Sort order must be an integer"),
    v.minValue(0, "Sort order must be 0 or greater")
  ),
  parentId: v.optional(v.nullable(v.string())),
});

export type CreateLinkInput = v.InferOutput<typeof CreateLinkSchema>;

export const UpdateLinkSchema = v.object({
  title: v.optional(
    v.pipe(
      v.string(),
      v.minLength(1, "Title cannot be empty"),
      v.maxLength(100, "Title cannot exceed 100 characters")
    )
  ),
  description: v.optional(
    v.nullable(
      v.pipe(v.string(), v.maxLength(300, "Description cannot exceed 300 characters"))
    )
  ),
  slug: v.optional(
    v.pipe(
      v.string(),
      v.minLength(1, "Slug cannot be empty"),
      v.maxLength(80, "Slug cannot exceed 80 characters"),
      v.regex(SlugPattern, "Slug must be lowercase letters, numbers, and hyphens only")
    )
  ),
  targetUrl: v.optional(
    v.pipe(v.string(), v.url("Please enter a valid URL"))
  ),
  imageUrl: v.optional(v.nullable(v.pipe(v.string(), v.url("Please enter a valid image URL")))),
  isProtected: v.optional(v.boolean()),
  password: v.optional(v.nullable(v.string())),
  isActive: v.optional(v.boolean()),
  sortOrder: v.optional(
    v.pipe(
      v.number(),
      v.integer("Sort order must be an integer"),
      v.minValue(0, "Sort order must be 0 or greater")
    )
  ),
  parentId: v.optional(v.nullable(v.string())),
});

export type UpdateLinkInput = v.InferOutput<typeof UpdateLinkSchema>;
