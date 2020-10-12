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
package org.eclipse.dirigible.kyma.oauth;

import javax.servlet.http.HttpServletRequest;

import org.eclipse.dirigible.api.v3.http.jwt.IJwtManager;
import org.eclipse.dirigible.kyma.utils.JwtUtils;
import org.eclipse.dirigible.kyma.utils.KymaUtils;

public class KymaJwtManager implements IJwtManager {

	@Override
	public boolean isInRole(HttpServletRequest request, String role) {
		return JwtUtils.isInRole(request, role);
	}
}
