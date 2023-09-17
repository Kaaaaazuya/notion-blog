import blogConfig from "@/blog.config";
import { Article } from "@/types/";
import { getArticlesFromFile, getArticleFromFile } from "./file";
import { getArticleFromNotion, getDatabase } from "./notion";

export const getArticles = async (): Promise<Article[]> => {
  if (blogConfig.use === "notion") {
    return getDatabase(process.env.NOTION_DATABASE_ID as string, {
      sorts: [
        {
          property: "rEYP",
          direction: "descending",
        },
      ],
    });
  }
  return getArticlesFromFile();
};

export const getFilteredArticles = async ({
  current,
  categoryId,
  tagId,
}: {
  current: number;
  categoryId?: string;
  tagId?: string;
}) => {
  const articles = await getArticles();
  const results = articles
    .filter(({ data }) => {
      if (data.status !== 'open') {
        return false;
      }
      if (categoryId && data.category !== categoryId) {
        return false;
      }
      if (tagId && !data.tags.includes(tagId)) {
        return false;
      }
      return true;
    })
    .sort((articleA, articleB) => {
      if (articleA.data.date > articleB.data.date) {
        return -1;
      } else if (articleA.data.date < articleB.data.date) {
        return 1;
      }
      return 0;
    })
    .slice(
      current * blogConfig.article.articlesPerPage,
      current * blogConfig.article.articlesPerPage +
        blogConfig.article.articlesPerPage
    )
    .map((article) => {
      const { content, ...others } = article;
      return others;
    });
  return results;
};

export const getArticle = async (
  slug: string
): Promise<{
  article: Article;
  related: Article[];
}> => {
  if (blogConfig.use === "notion") {
    return getArticleFromNotion(slug);
  }
  return getArticleFromFile(slug);
};
