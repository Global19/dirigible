/**
 * Copyright (c) 2010-2020 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * Contributors:
 *   SAP - initial API and implementation
 */
package org.eclipse.dirigible.kyma.oauth.filters;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.dirigible.api.v3.utils.EscapeFacade;
import org.eclipse.dirigible.kyma.utils.KymaUtils;
import org.eclipse.dirigible.repository.api.IRepositoryStructure;
import org.slf4j.Logger;

public abstract class AbstractOAuthFilter implements Filter {

	protected abstract Logger getLogger();

	public void init(FilterConfig filterConfig) throws ServletException {
		// Do nothing
	}

	public void destroy() {
		// Do nothing
	}

	/**
	 * Authenticate.
	 * @throws IOException 
	 * 
	 */
	protected void authenticate(ServletRequest request, ServletResponse response) throws IOException {
		String redirectUrl = KymaUtils.getAuthenticationUrl();
		((HttpServletResponse) response).sendRedirect(redirectUrl);
	}

	/**
	 * Unauthorized.
	 *
	 */
	protected void unauthorized(ServletRequest request, ServletResponse response, String message) throws IOException {
		HttpServletRequest httpServletRequest = (HttpServletRequest) request;
		HttpServletResponse httpServletResponse = (HttpServletResponse) response;

		String path = httpServletRequest.getPathInfo() != null ? httpServletRequest.getPathInfo() : IRepositoryStructure.SEPARATOR;
		String error = String.format("Unauthorized access is forbidden: %s", path, message);

		getLogger().warn(error);

		error = EscapeFacade.escapeHtml4(error);
		error = EscapeFacade.escapeJavascript(error);
		httpServletResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, error);
	}

	/**
	 * Forbidden.
	 *
	 */
	protected void forbidden(ServletRequest request, ServletResponse response, String message) throws IOException {
		HttpServletRequest httpServletRequest = (HttpServletRequest) request;
		HttpServletResponse httpServletResponse = (HttpServletResponse) response;

		String path = httpServletRequest.getPathInfo() != null ? httpServletRequest.getPathInfo() : IRepositoryStructure.SEPARATOR;
		String error = String.format("Requested URI [%s] is forbidden: %s", path, message);

		getLogger().warn(error);

		error = EscapeFacade.escapeHtml4(error);
		error = EscapeFacade.escapeJavascript(error);
		httpServletResponse.sendError(HttpServletResponse.SC_FORBIDDEN, error);
	}
}
